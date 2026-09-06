import { afterEach, describe, expect, it, vi } from "vitest";
import {
  priceIdFor,
  planForPriceId,
  stripeBillingEnabled,
} from "@/lib/stripe/plans";

afterEach(() => vi.unstubAllEnvs());

function stubPrices() {
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
  vi.stubEnv("STRIPE_PRICE_PRO_MONTH", "price_pm");
  vi.stubEnv("STRIPE_PRICE_PRO_YEAR", "price_py");
  vi.stubEnv("STRIPE_PRICE_BUSINESS_MONTH", "price_bm");
  vi.stubEnv("STRIPE_PRICE_BUSINESS_YEAR", "price_by");
}

describe("stripe price map", () => {
  it("stripeBillingEnabled needs the secret key + monthly prices", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    expect(stripeBillingEnabled()).toBe(false);
    stubPrices();
    expect(stripeBillingEnabled()).toBe(true);
    vi.stubEnv("STRIPE_PRICE_BUSINESS_MONTH", "");
    expect(stripeBillingEnabled()).toBe(false);
  });

  it("priceIdFor resolves plan + interval", () => {
    stubPrices();
    expect(priceIdFor("pro", "month")).toBe("price_pm");
    expect(priceIdFor("pro", "year")).toBe("price_py");
    expect(priceIdFor("business", "month")).toBe("price_bm");
    expect(priceIdFor("business", "year")).toBe("price_by");
  });

  it("planForPriceId does the reverse lookup for the webhook", () => {
    stubPrices();
    expect(planForPriceId("price_pm")).toBe("pro");
    expect(planForPriceId("price_py")).toBe("pro");
    expect(planForPriceId("price_bm")).toBe("business");
    expect(planForPriceId("price_by")).toBe("business");
    expect(planForPriceId("price_unknown")).toBeNull();
    expect(planForPriceId(null)).toBeNull();
  });
});
