import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

const h = vi.hoisted(() => {
  const limit = vi.fn();
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));
  return {
    limit,
    select,
    sendEmail: vi.fn(),
    createNotification: vi.fn(),
  };
});

vi.mock("@/lib/db", () => ({ db: { select: h.select } }));
vi.mock("@/lib/email/send", () => ({ sendEmail: h.sendEmail }));
vi.mock("@/lib/notifications/create", () => ({
  createNotification: h.createNotification,
}));

import { notifyBillingTransition } from "@/lib/notifications/billing";

const unpaid = {
  id: "sub_1",
  status: "canceled",
  cancellation_details: { reason: "payment_failed" },
} as unknown as Stripe.Subscription;

beforeEach(() => {
  vi.clearAllMocks();
  h.limit.mockResolvedValue([
    { email: "artisan@example.com", businessName: "Plomberie Durand" },
  ]);
  h.sendEmail.mockResolvedValue({ id: "email_1" });
  h.createNotification.mockResolvedValue({ id: "n_1" });
});

describe("notifyBillingTransition", () => {
  it("welcomes a new subscriber by email and in the app", async () => {
    await notifyBillingTransition("t_1", { kind: "started", plan: "pro" }, null);

    expect(h.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "artisan@example.com",
        subject: "Votre abonnement Traballo Pro est actif",
      })
    );
    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "t_1",
        type: "billing.subscription_started",
        title: "Abonnement Pro activé",
        actionUrl: "/dashboard/settings?tab=abonnement",
      })
    );
  });

  it("announces a plan change", async () => {
    await notifyBillingTransition(
      "t_1",
      { kind: "changed", from: "pro", to: "business" },
      null
    );
    expect(h.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Votre abonnement Traballo passe au plan Business",
      })
    );
    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "billing.subscription_changed",
        title: "Plan modifié : Pro → Business",
      })
    );
  });

  it("tells why the subscription ended", async () => {
    await notifyBillingTransition(
      "t_1",
      { kind: "canceled", from: "business" },
      unpaid
    );
    expect(h.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Votre abonnement Traballo est terminé",
      })
    );
    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "billing.subscription_canceled",
        title: "Abonnement terminé : retour au plan Free",
        body: expect.stringMatching(/paiement/i),
      })
    );
  });

  it("still notifies in the app when the artisan has no profile email", async () => {
    h.limit.mockResolvedValue([]);
    await notifyBillingTransition("t_1", { kind: "started", plan: "pro" }, null);
    expect(h.sendEmail).not.toHaveBeenCalled();
    expect(h.createNotification).toHaveBeenCalledTimes(1);
  });

  it("never throws: a failed email does not stop the in-app notice", async () => {
    h.sendEmail.mockRejectedValue(new Error("resend down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      notifyBillingTransition("t_1", { kind: "canceled", from: "pro" }, null)
    ).resolves.toBeUndefined();
    spy.mockRestore();
    expect(h.createNotification).toHaveBeenCalledTimes(1);
  });
});
