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

export type TenantPlan = "free" | PaidPlan;

/** What the tenant row says about billing. */
export type BillingState = { plan: TenantPlan; subscriptionId: string | null };

export type BillingTransition =
  | { kind: "started"; plan: PaidPlan }
  | { kind: "changed"; from: PaidPlan; to: PaidPlan }
  | { kind: "canceled"; from: PaidPlan };

function paying(state: BillingState): state is BillingState & { plan: PaidPlan } {
  return state.subscriptionId !== null && state.plan !== "free";
}

/**
 * What changed for the artisan between two billing states, if anything. A
 * plan without a subscription (comped by an admin) does not count as paying.
 * Pure: the same before/after always gives the same answer, so a replayed
 * webhook that finds the state already applied yields `null`.
 */
export function billingTransition(
  before: BillingState,
  after: BillingState
): BillingTransition | null {
  const was = paying(before);
  const is = paying(after);
  if (!was && is) return { kind: "started", plan: after.plan as PaidPlan };
  if (was && !is) return { kind: "canceled", from: before.plan as PaidPlan };
  if (was && is && before.plan !== after.plan) {
    return {
      kind: "changed",
      from: before.plan as PaidPlan,
      to: after.plan as PaidPlan,
    };
  }
  return null;
}

/** Why a subscription stopped granting a plan: the artisan, or payment. */
export function cancellationCause(
  sub: Stripe.Subscription | null
): "requested" | "payment" {
  const reason = sub?.cancellation_details?.reason;
  if (reason === "payment_failed" || reason === "payment_disputed") {
    return "payment";
  }
  if (sub && ["unpaid", "incomplete_expired"].includes(sub.status)) {
    return "payment";
  }
  return "requested";
}

/**
 * Apply a subscription's state to the tenant. Declarative + idempotent —
 * safe to replay from any webhook event.
 *
 * Reads the previous state under a row lock and returns the transition, so
 * that among the several events Stripe sends for one change (and its
 * retries), exactly one sees it — even when they arrive concurrently.
 */
export async function syncSubscriptionToTenant(
  tenantId: string,
  sub: Stripe.Subscription | null
): Promise<BillingTransition | null> {
  const plan = sub ? planFromSubscription(sub) : null;
  const next: BillingState = {
    plan: plan ?? "free",
    subscriptionId: sub && plan ? sub.id : null,
  };

  return db.transaction(async (tx) => {
    const [before] = await tx
      .select({
        plan: tenants.plan,
        subscriptionId: tenants.stripeSubscriptionId,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .for("update");
    if (!before) return null;

    await tx
      .update(tenants)
      .set({
        plan: next.plan,
        stripeSubscriptionId: next.subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    return billingTransition(before, next);
  });
}
