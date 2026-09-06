/**
 * src/lib/stripe/plans.ts
 * Maps Traballo plans/intervals ↔ Stripe price IDs (from env), and resolves a
 * plan from a price ID for the webhook. Provisioned by scripts/stripe-provision.ts.
 */

export type PaidPlan = "pro" | "business";
export type BillingInterval = "month" | "year";

type PriceMap = Record<PaidPlan, Record<BillingInterval, string | undefined>>;

function priceMap(): PriceMap {
  return {
    pro: {
      month: process.env.STRIPE_PRICE_PRO_MONTH,
      year: process.env.STRIPE_PRICE_PRO_YEAR,
    },
    business: {
      month: process.env.STRIPE_PRICE_BUSINESS_MONTH,
      year: process.env.STRIPE_PRICE_BUSINESS_YEAR,
    },
  };
}

/** True when Checkout can run (secret key + at least the monthly prices). */
export function stripeBillingEnabled(): boolean {
  const m = priceMap();
  return Boolean(
    process.env.STRIPE_SECRET_KEY && m.pro.month && m.business.month
  );
}

export function priceIdFor(
  plan: PaidPlan,
  interval: BillingInterval
): string | undefined {
  return priceMap()[plan][interval];
}

/** Reverse lookup for the webhook: which plan does this Stripe price grant? */
export function planForPriceId(priceId: string | null | undefined): PaidPlan | null {
  if (!priceId) return null;
  const m = priceMap();
  for (const plan of ["pro", "business"] as PaidPlan[]) {
    if (m[plan].month === priceId || m[plan].year === priceId) return plan;
  }
  return null;
}
