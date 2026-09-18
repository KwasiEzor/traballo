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
import { SubscriptionStartedEmail } from "@/lib/email/templates/subscription-started-email";
import { SubscriptionChangedEmail } from "@/lib/email/templates/subscription-changed-email";
import { SubscriptionCanceledEmail } from "@/lib/email/templates/subscription-canceled-email";
import { createNotification } from "@/lib/notifications/create";
import type { PaidPlan } from "@/lib/stripe/plans";

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
      await notifyPlanTransition(
        tenantId,
        await syncSubscriptionToTenant(tenantId, sub)
      );
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
      await notifyPlanTransition(
        tenantId,
        await syncSubscriptionToTenant(
          tenantId,
          event.type === "customer.subscription.deleted" ? null : sub
        )
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
      await notifyPlanTransition(
        tenantId,
        await syncSubscriptionToTenant(tenantId, sub)
      );
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

      await createNotification({
        tenantId,
        type: "billing.payment_failed",
        title: "Paiement de l'abonnement échoué",
        body: "Stripe va réessayer. Mettez à jour votre moyen de paiement pour éviter de repasser en Free.",
        actionUrl: "/dashboard/settings",
      });
      return;
    }
  }
}

const PLAN_NAME: Record<"free" | PaidPlan, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

/**
 * Reacts to an actual plan transition, not to the Stripe event that caused
 * it — `customer.subscription.updated` fires for plenty of no-op changes
 * (trial ending, metadata, proration), and Checkout + the subsequent
 * `subscription.created` both sync the same transition, so diffing against
 * what's already persisted keeps this idempotent without extra bookkeeping.
 */
async function notifyPlanTransition(
  tenantId: string,
  { previousPlan, newPlan }: { previousPlan: "free" | PaidPlan; newPlan: "free" | PaidPlan }
): Promise<void> {
  if (previousPlan === newPlan) return;

  const profile = await db.query.artisanProfiles.findFirst({
    where: eq(artisanProfiles.tenantId, tenantId),
    columns: { email: true, businessName: true },
  });
  if (!profile) return;

  const actionUrl = "/dashboard/settings?tab=abonnement";

  if (previousPlan === "free") {
    if (profile.email) {
      await sendEmail({
        to: profile.email,
        subject: `Bienvenue sur le plan ${PLAN_NAME[newPlan]}`,
        react: SubscriptionStartedEmail({
          businessName: profile.businessName,
          plan: newPlan as PaidPlan,
        }),
      }).catch(() => {});
    }
    await createNotification({
      tenantId,
      type: "billing.subscription_started",
      title: `Abonnement ${PLAN_NAME[newPlan]} actif`,
      actionUrl,
    });
    return;
  }

  if (newPlan === "free") {
    if (profile.email) {
      await sendEmail({
        to: profile.email,
        subject: "Votre abonnement Traballo est annulé",
        react: SubscriptionCanceledEmail({ businessName: profile.businessName }),
      }).catch(() => {});
    }
    await createNotification({
      tenantId,
      type: "billing.subscription_canceled",
      title: "Abonnement annulé — retour au plan Free",
      actionUrl,
    });
    return;
  }

  // Both paid, different plans (Pro ↔ Business).
  if (profile.email) {
    await sendEmail({
      to: profile.email,
      subject: `Votre abonnement passe au plan ${PLAN_NAME[newPlan]}`,
      react: SubscriptionChangedEmail({
        businessName: profile.businessName,
        previousPlan: previousPlan as PaidPlan,
        newPlan: newPlan as PaidPlan,
      }),
    }).catch(() => {});
  }
  await createNotification({
    tenantId,
    type: "billing.subscription_changed",
    title: `Abonnement changé — plan ${PLAN_NAME[newPlan]}`,
    actionUrl,
  });
}
