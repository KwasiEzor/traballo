import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants, artisanProfiles } from "@/db/schema";
import { getStripe } from "@/lib/stripe/client";
import {
  tenantIdForCustomer,
  syncSubscriptionToTenant,
} from "@/lib/stripe/billing";
import { sendEmail } from "@/lib/email/send";
import { PaymentFailedEmail } from "@/lib/email/templates/payment-failed-email";

export const dynamic = "force-dynamic";

const RELEVANT = new Set<Stripe.Event["type"]>([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

export async function POST(request: Request): Promise<Response> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return new Response("Stripe non configuré.", { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  const payload = await request.text();
  if (!sig) return new Response("Signature manquante.", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    console.error("[stripe webhook] bad signature:", err);
    return new Response("Signature invalide.", { status: 400 });
  }

  if (!RELEVANT.has(event.type)) {
    return Response.json({ received: true, ignored: event.type });
  }

  try {
    await handle(stripe, event);
  } catch (err) {
    console.error(`[stripe webhook] ${event.type} failed:`, err);
    // 500 → Stripe retries.
    return new Response("Erreur de traitement.", { status: 500 });
  }

  return Response.json({ received: true });
}

async function handle(stripe: Stripe, event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.subscription) return;
      const tenantId =
        session.client_reference_id ??
        (typeof session.customer === "string"
          ? await tenantIdForCustomer(session.customer)
          : null);
      if (!tenantId) return;
      const sub = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      await syncSubscriptionToTenant(tenantId, sub);
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const tenantId =
        (sub.metadata?.tenantId as string | undefined) ??
        (typeof sub.customer === "string"
          ? await tenantIdForCustomer(sub.customer)
          : null);
      if (!tenantId) return;
      await syncSubscriptionToTenant(
        tenantId,
        event.type === "customer.subscription.deleted" ? null : sub
      );
      return;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId =
        typeof invoice.subscription === "string" ? invoice.subscription : null;
      if (!subId) return;
      const tenantId =
        typeof invoice.customer === "string"
          ? await tenantIdForCustomer(invoice.customer)
          : null;
      if (!tenantId) return;
      const sub = await stripe.subscriptions.retrieve(subId);
      await syncSubscriptionToTenant(tenantId, sub);
      return;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const tenantId =
        typeof invoice.customer === "string"
          ? await tenantIdForCustomer(invoice.customer)
          : null;
      if (!tenantId) return;

      // Notify the artisan — Stripe keeps retrying; a later
      // subscription.deleted (dunning exhausted) drops them to Free.
      const profile = await db.query.artisanProfiles.findFirst({
        where: eq(artisanProfiles.tenantId, tenantId),
        columns: { email: true, businessName: true },
      });
      const [t] = await db
        .select({ customerId: tenants.stripeCustomerId })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);
      if (profile?.email) {
        await sendEmail({
          to: profile.email,
          subject: "Paiement de votre abonnement Traballo — action requise",
          react: PaymentFailedEmail({
            businessName: profile.businessName,
            amountDue:
              invoice.amount_due != null
                ? `${(invoice.amount_due / 100).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })} €`
                : undefined,
            portalHint: Boolean(t?.customerId),
          }),
        }).catch(() => {});
      }
      return;
    }
  }
}
