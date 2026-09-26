import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

const h = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  retrieve: vi.fn(),
  tenantIdForCustomer: vi.fn(),
  syncSubscriptionToTenant: vi.fn(),
  notifyBillingTransition: vi.fn(),
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: h.constructEvent },
    subscriptions: { retrieve: h.retrieve },
  }),
}));
vi.mock("@/lib/stripe/billing", () => ({
  tenantIdForCustomer: h.tenantIdForCustomer,
  syncSubscriptionToTenant: h.syncSubscriptionToTenant,
}));
vi.mock("@/lib/notifications/billing", () => ({
  notifyBillingTransition: h.notifyBillingTransition,
}));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/notifications/create", () => ({ createNotification: vi.fn() }));

import { POST } from "@/app/api/webhooks/stripe/route";

const SUB = {
  id: "sub_1",
  customer: "cus_1",
  status: "active",
  metadata: { tenantId: "t_1" },
  items: { data: [{ price: { id: "price_pm" } }] },
} as unknown as Stripe.Subscription;

const STARTED = { kind: "started", plan: "pro" } as const;

function event(type: string, object: unknown): Stripe.Event {
  return { id: `evt_${type}`, type, data: { object } } as unknown as Stripe.Event;
}

function deliver(e: Stripe.Event): Promise<Response> {
  h.constructEvent.mockReturnValueOnce(e);
  return POST(
    new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=abc" },
      body: "{}",
    })
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
  h.retrieve.mockResolvedValue(SUB);
  h.tenantIdForCustomer.mockResolvedValue("t_1");
  h.syncSubscriptionToTenant.mockResolvedValue(null);
  h.notifyBillingTransition.mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/webhooks/stripe — subscription notifications", () => {
  it("notifies when an event changes the tenant's subscription", async () => {
    h.syncSubscriptionToTenant.mockResolvedValueOnce(STARTED);
    const res = await deliver(event("customer.subscription.created", SUB));

    expect(res.status).toBe(200);
    expect(h.syncSubscriptionToTenant).toHaveBeenCalledWith("t_1", SUB);
    expect(h.notifyBillingTransition).toHaveBeenCalledWith("t_1", STARTED, SUB);
  });

  it("sends a single notice for the burst of events of one checkout", async () => {
    // First event flips the state; the next ones find it already applied.
    h.syncSubscriptionToTenant.mockResolvedValueOnce(STARTED);
    const session = {
      mode: "subscription",
      subscription: "sub_1",
      client_reference_id: "t_1",
      customer: "cus_1",
    };
    const invoice = { subscription: "sub_1", customer: "cus_1" };

    await deliver(event("checkout.session.completed", session));
    await deliver(event("customer.subscription.created", SUB));
    await deliver(event("invoice.paid", invoice));
    await deliver(event("customer.subscription.created", SUB)); // Stripe retry

    expect(h.syncSubscriptionToTenant).toHaveBeenCalledTimes(4);
    expect(h.notifyBillingTransition).toHaveBeenCalledTimes(1);
  });

  it("drops to Free on deletion and hands over the subscription for the cause", async () => {
    const deleted = {
      ...SUB,
      status: "canceled",
      cancellation_details: { reason: "payment_failed" },
    };
    const canceled = { kind: "canceled", from: "pro" } as const;
    h.syncSubscriptionToTenant.mockResolvedValueOnce(canceled);

    await deliver(event("customer.subscription.deleted", deleted));

    expect(h.syncSubscriptionToTenant).toHaveBeenCalledWith("t_1", null);
    expect(h.notifyBillingTransition).toHaveBeenCalledWith("t_1", canceled, deleted);
  });

  it("ignores a subscription it cannot tie to a tenant", async () => {
    h.tenantIdForCustomer.mockResolvedValue(null);
    await deliver(
      event("customer.subscription.updated", { ...SUB, metadata: {} })
    );
    expect(h.syncSubscriptionToTenant).not.toHaveBeenCalled();
    expect(h.notifyBillingTransition).not.toHaveBeenCalled();
  });

  it("rejects a bad signature before reading anything", async () => {
    h.constructEvent.mockImplementationOnce(() => {
      throw new Error("bad sig");
    });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "forged" },
        body: "{}",
      })
    );
    spy.mockRestore();
    expect(res.status).toBe(400);
    expect(h.syncSubscriptionToTenant).not.toHaveBeenCalled();
  });
});
