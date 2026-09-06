/**
 * src/lib/stripe/billing.ts
 * Tenant ↔ Stripe customer glue + plan resolution from a subscription.
 * Uses the owner DB connection (server actions / webhook, no RLS needed here).
 */

import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { tenants, artisanProfiles } from "@/db/schema";
import { getStripe } from "./client";
import { planForPriceId, type PaidPlan } from "./plans";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://app.traballo.pro";

/** Returns the tenant's Stripe customer id, creating the customer on first use. */
export async function getOrCreateCustomer(tenantId: string): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe non configuré.");

  const [row] = await db
    .select({
      customerId: tenants.stripeCustomerId,
      slug: tenants.slug,
    })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (row?.customerId) return row.customerId;

  const profile = await db.query.artisanProfiles.findFirst({
    where: eq(artisanProfiles.tenantId, tenantId),
    columns: { email: true, businessName: true, ownerName: true, phone: true },
  });

  const customer = await stripe.customers.create({
    email: profile?.email,
    name: profile?.businessName ?? row?.slug,
    phone: profile?.phone ?? undefined,
    metadata: { tenantId, slug: row?.slug ?? "" },
  });

  await db
    .update(tenants)
    .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));

  return customer.id;
}

export async function tenantIdForCustomer(
  customerId: string
): Promise<string | null> {
  const [row] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.stripeCustomerId, customerId))
    .limit(1);
  return row?.id ?? null;
}

/** The paid plan a subscription currently grants, or null if it grants nothing. */
export function planFromSubscription(sub: Stripe.Subscription): PaidPlan | null {
  // A subscription that is no longer paying grants nothing.
  if (!["active", "trialing", "past_due"].includes(sub.status)) return null;
  const priceId = sub.items.data[0]?.price?.id;
  return planForPriceId(priceId);
}

/**
 * Apply a subscription's state to the tenant. Declarative + idempotent —
 * safe to replay from any webhook event.
 */
export async function syncSubscriptionToTenant(
  tenantId: string,
  sub: Stripe.Subscription | null
): Promise<void> {
  const plan = sub ? planFromSubscription(sub) : null;

  await db
    .update(tenants)
    .set({
      plan: plan ?? "free",
      stripeSubscriptionId:
        sub && plan ? sub.id : null,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));
}
