import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const lockFor = vi.fn();
  const selectWhere = vi.fn(() => ({ for: lockFor }));
  const tx = {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: selectWhere })) })),
    update: vi.fn(() => ({ set: updateSet })),
  };
  const transaction = vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx));
  return { updateSet, lockFor, tx, transaction };
});

vi.mock("@/lib/db", () => ({ db: { transaction: h.transaction } }));

import {
  billingTransition,
  cancellationCause,
  planFromSubscription,
  syncSubscriptionToTenant,
} from "@/lib/stripe/billing";
import type Stripe from "stripe";

beforeEach(() => {
  vi.stubEnv("STRIPE_PRICE_PRO_MONTH", "price_pm");
  vi.stubEnv("STRIPE_PRICE_PRO_YEAR", "price_py");
  vi.stubEnv("STRIPE_PRICE_BUSINESS_MONTH", "price_bm");
  vi.stubEnv("STRIPE_PRICE_BUSINESS_YEAR", "price_by");
  vi.clearAllMocks();
  h.lockFor.mockResolvedValue([{ plan: "free", subscriptionId: null }]);
});
afterEach(() => vi.unstubAllEnvs());

function sub(
  status: string,
  priceId: string,
  extra: Partial<Stripe.Subscription> = {}
): Stripe.Subscription {
  return {
    id: "sub_1",
    status,
    items: { data: [{ price: { id: priceId } }] },
    cancellation_details: null,
    ...extra,
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

describe("billingTransition", () => {
  const FREE = { plan: "free" as const, subscriptionId: null };

  it("detects a new subscription", () => {
    expect(
      billingTransition(FREE, { plan: "pro", subscriptionId: "sub_1" })
    ).toEqual({ kind: "started", plan: "pro" });
  });

  it("treats a comped plan without subscription as not paying yet", () => {
    expect(
      billingTransition(
        { plan: "pro", subscriptionId: null },
        { plan: "pro", subscriptionId: "sub_1" }
      )
    ).toEqual({ kind: "started", plan: "pro" });
  });

  it("detects an upgrade or a downgrade", () => {
    expect(
      billingTransition(
        { plan: "pro", subscriptionId: "sub_1" },
        { plan: "business", subscriptionId: "sub_1" }
      )
    ).toEqual({ kind: "changed", from: "pro", to: "business" });
    expect(
      billingTransition(
        { plan: "business", subscriptionId: "sub_1" },
        { plan: "pro", subscriptionId: "sub_1" }
      )
    ).toEqual({ kind: "changed", from: "business", to: "pro" });
  });

  it("detects the return to Free", () => {
    expect(
      billingTransition({ plan: "business", subscriptionId: "sub_1" }, FREE)
    ).toEqual({ kind: "canceled", from: "business" });
  });

  it("sees nothing on a replayed or unrelated event", () => {
    const pro = { plan: "pro" as const, subscriptionId: "sub_1" };
    expect(billingTransition(pro, pro)).toBeNull();
    expect(billingTransition(FREE, FREE)).toBeNull();
  });
});

describe("cancellationCause", () => {
  it("blames payment when Stripe says so", () => {
    for (const reason of ["payment_failed", "payment_disputed"] as const) {
      expect(
        cancellationCause(
          sub("canceled", "price_pm", { cancellation_details: { reason } as never })
        )
      ).toBe("payment");
    }
  });

  it("blames payment for a subscription left unpaid", () => {
    expect(cancellationCause(sub("unpaid", "price_pm"))).toBe("payment");
  });

  it("otherwise treats it as the artisan's request", () => {
    expect(
      cancellationCause(
        sub("canceled", "price_pm", {
          cancellation_details: { reason: "cancellation_requested" } as never,
        })
      )
    ).toBe("requested");
    expect(cancellationCause(null)).toBe("requested");
  });
});

describe("syncSubscriptionToTenant", () => {
  it("locks the tenant row, applies the plan and reports the transition", async () => {
    const t = await syncSubscriptionToTenant("t_1", sub("active", "price_bm"));
    expect(h.lockFor).toHaveBeenCalledWith("update");
    expect(h.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "business", stripeSubscriptionId: "sub_1" })
    );
    expect(t).toEqual({ kind: "started", plan: "business" });
  });

  it("reports nothing when a replay finds the state already applied", async () => {
    h.lockFor.mockResolvedValue([{ plan: "business", subscriptionId: "sub_1" }]);
    const t = await syncSubscriptionToTenant("t_1", sub("active", "price_bm"));
    expect(t).toBeNull();
  });

  it("drops the tenant to free when the subscription is gone", async () => {
    h.lockFor.mockResolvedValue([{ plan: "pro", subscriptionId: "sub_1" }]);
    const t = await syncSubscriptionToTenant("t_1", null);
    expect(h.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "free", stripeSubscriptionId: null })
    );
    expect(t).toEqual({ kind: "canceled", from: "pro" });
  });

  it("drops to free when the subscription no longer pays", async () => {
    await syncSubscriptionToTenant("t_1", sub("canceled", "price_bm"));
    expect(h.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "free", stripeSubscriptionId: null })
    );
  });

  it("does nothing for an unknown tenant", async () => {
    h.lockFor.mockResolvedValue([]);
    const t = await syncSubscriptionToTenant("ghost", sub("active", "price_pm"));
    expect(t).toBeNull();
    expect(h.tx.update).not.toHaveBeenCalled();
  });
});
