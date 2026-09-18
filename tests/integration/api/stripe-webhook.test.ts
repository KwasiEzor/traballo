import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const constructEvent = vi.fn();
  const stripe = { webhooks: { constructEvent } };
  return {
    constructEvent,
    stripe,
    getStripe: vi.fn(() => stripe),
    tenantIdForCustomer: vi.fn(),
    syncSubscriptionToTenant: vi.fn(),
    profilesFindFirst: vi.fn(),
    selectLimit: vi.fn(),
    sendEmail: vi.fn(),
    createNotification: vi.fn(),
  };
});

vi.mock("@/lib/stripe/client", () => ({ getStripe: h.getStripe }));
vi.mock("@/lib/stripe/billing", () => ({
  tenantIdForCustomer: h.tenantIdForCustomer,
  syncSubscriptionToTenant: h.syncSubscriptionToTenant,
}));
vi.mock("@/lib/db", () => ({
  db: {
    query: { artisanProfiles: { findFirst: h.profilesFindFirst } },
    select: vi.fn(() => ({
      from: vi.fn(() => ({ where: vi.fn(() => ({ limit: h.selectLimit })) })),
    })),
  },
}));
vi.mock("@/lib/email/send", () => ({ sendEmail: h.sendEmail }));
vi.mock("@/lib/notifications/create", () => ({
  createNotification: h.createNotification,
}));

import { POST } from "@/app/api/webhooks/stripe/route";

function req(): Request {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "sig_test" },
    body: "{}",
  });
}

function subscriptionEvent(type: string, customer = "cus_1") {
  return {
    type,
    data: { object: { id: "sub_1", customer, metadata: {} } },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
  h.tenantIdForCustomer.mockResolvedValue("t_1");
  h.profilesFindFirst.mockResolvedValue({
    email: "artisan@example.com",
    businessName: "Plomberie Durand",
  });
  h.selectLimit.mockResolvedValue([{ customerId: "cus_1" }]);
  h.sendEmail.mockResolvedValue({ id: "email_1" });
  h.createNotification.mockResolvedValue({ id: "n_1" });
});

afterEach(() => vi.unstubAllEnvs());

describe("POST /api/webhooks/stripe — plan transitions", () => {
  it("sends the started email + notification on free → pro", async () => {
    h.constructEvent.mockReturnValue(
      subscriptionEvent("customer.subscription.updated")
    );
    h.syncSubscriptionToTenant.mockResolvedValue({
      previousPlan: "free",
      newPlan: "pro",
    });

    const res = await POST(req());

    expect(res.status).toBe(200);
    expect(h.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "artisan@example.com" })
    );
    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "t_1", type: "billing.subscription_started" })
    );
  });

  it("sends the changed email + notification on pro → business", async () => {
    h.constructEvent.mockReturnValue(
      subscriptionEvent("customer.subscription.updated")
    );
    h.syncSubscriptionToTenant.mockResolvedValue({
      previousPlan: "pro",
      newPlan: "business",
    });

    await POST(req());

    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "t_1", type: "billing.subscription_changed" })
    );
  });

  it("sends the canceled email + notification on business → free", async () => {
    h.constructEvent.mockReturnValue(
      subscriptionEvent("customer.subscription.deleted")
    );
    h.syncSubscriptionToTenant.mockResolvedValue({
      previousPlan: "business",
      newPlan: "free",
    });

    await POST(req());

    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "t_1", type: "billing.subscription_canceled" })
    );
  });

  it("sends nothing when the plan didn't actually change", async () => {
    h.constructEvent.mockReturnValue(
      subscriptionEvent("customer.subscription.updated")
    );
    h.syncSubscriptionToTenant.mockResolvedValue({
      previousPlan: "pro",
      newPlan: "pro",
    });

    const res = await POST(req());

    expect(res.status).toBe(200);
    expect(h.sendEmail).not.toHaveBeenCalled();
    expect(h.createNotification).not.toHaveBeenCalled();
  });
});
