import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const updateSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
vi.mock("@/lib/db", () => ({
  db: { update: vi.fn(() => ({ set: updateSet })) },
}));

import { planFromSubscription, syncSubscriptionToTenant } from "@/lib/stripe/billing";
import type Stripe from "stripe";

beforeEach(() => {
  vi.stubEnv("STRIPE_PRICE_PRO_MONTH", "price_pm");
  vi.stubEnv("STRIPE_PRICE_PRO_YEAR", "price_py");
  vi.stubEnv("STRIPE_PRICE_BUSINESS_MONTH", "price_bm");
  vi.stubEnv("STRIPE_PRICE_BUSINESS_YEAR", "price_by");
  updateSet.mockClear();
});
afterEach(() => vi.unstubAllEnvs());

function sub(status: string, priceId: string): Stripe.Subscription {
  return {
    id: "sub_1",
    status,
    items: { data: [{ price: { id: priceId } }] },
  } as unknown as Stripe.Subscription;
}

describe("planFromSubscription", () => {
  it("maps an active subscription to its plan", () => {
    expect(planFromSubscription(sub("active", "price_bm"))).toBe("business");
    expect(planFromSubscription(sub("trialing", "price_pm"))).toBe("pro");
    expect(planFromSubscription(sub("past_due", "price_py"))).toBe("pro");
  });

  it("grants nothing for a canceled / incomplete subscription", () => {
    expect(planFromSubscription(sub("canceled", "price_bm"))).toBeNull();
    expect(planFromSubscription(sub("incomplete_expired", "price_pm"))).toBeNull();
    expect(planFromSubscription(sub("unpaid", "price_pm"))).toBeNull();
  });
});

describe("syncSubscriptionToTenant", () => {
  it("sets the tenant to the granted plan + stores the subscription id", async () => {
    await syncSubscriptionToTenant("t_1", sub("active", "price_bm"));
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "business", stripeSubscriptionId: "sub_1" })
    );
  });

  it("drops the tenant to free when the subscription is gone", async () => {
    await syncSubscriptionToTenant("t_1", null);
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "free", stripeSubscriptionId: null })
    );
  });

  it("drops to free when the subscription no longer pays", async () => {
    await syncSubscriptionToTenant("t_1", sub("canceled", "price_bm"));
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "free", stripeSubscriptionId: null })
    );
  });
});
