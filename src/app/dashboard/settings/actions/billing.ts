"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenants } from "@/db/schema";
import { getStripe } from "@/lib/stripe/client";
import { getOrCreateCustomer, APP_URL } from "@/lib/stripe/billing";
import { priceIdFor, stripeBillingEnabled } from "@/lib/stripe/plans";

const checkoutSchema = z.object({
  plan: z.enum(["pro", "business"]),
  interval: z.enum(["month", "year"]),
});

export type BillingState = { error?: string };

/** Start a Stripe Checkout session for a paid plan and redirect to it. */
export async function startCheckout(
  _prev: BillingState,
  formData: FormData
): Promise<BillingState> {
  const { tenantId, impersonating } = await requireAuth();
  if (impersonating) return { error: "Action indisponible en mode support." };

  const parsed = checkoutSchema.safeParse({
    plan: formData.get("plan"),
    interval: formData.get("interval"),
  });
  if (!parsed.success) return { error: "Requête invalide." };
  if (!stripeBillingEnabled()) return { error: "Le paiement en ligne n'est pas encore actif." };

  const stripe = getStripe()!;
  const price = priceIdFor(parsed.data.plan, parsed.data.interval);
  if (!price) return { error: "Tarif introuvable." };

  let url: string;
  try {
    const customer = await getOrCreateCustomer(tenantId);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [{ price, quantity: 1 }],
      client_reference_id: tenantId,
      subscription_data: { metadata: { tenantId } },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${APP_URL}/dashboard/settings?tab=abonnement&checkout=success`,
      cancel_url: `${APP_URL}/dashboard/settings?tab=abonnement&checkout=cancel`,
    });
    if (!session.url) return { error: "Stripe n'a pas renvoyé de lien." };
    url = session.url;
  } catch {
    return { error: "Impossible de démarrer le paiement. Réessayez." };
  }

  redirect(url);
}

/** Open the Stripe billing portal (manage / cancel / payment method). */
export async function openBillingPortal(): Promise<void> {
  const { tenantId } = await requireAuth();

  const [row] = await db
    .select({ customerId: tenants.stripeCustomerId })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!row?.customerId) redirect("/dashboard/settings?tab=abonnement");

  const stripe = getStripe();
  if (!stripe) redirect("/dashboard/settings?tab=abonnement");

  const session = await stripe!.billingPortal.sessions.create({
    customer: row!.customerId!,
    return_url: `${APP_URL}/dashboard/settings?tab=abonnement`,
  });
  redirect(session.url);
}
