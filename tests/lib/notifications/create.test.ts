import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const returning = vi.fn();
  const insertValues = vi.fn(() => ({ returning }));
  const insert = vi.fn(() => ({ values: insertValues }));
  const selectLimit = vi.fn();
  const selectWhere = vi.fn(() => ({ limit: selectLimit }));
  const selectFrom = vi.fn(() => ({ where: selectWhere }));
  const select = vi.fn(() => ({ from: selectFrom }));
  const getNotificationPrefs = vi.fn();
  const disabledChannels = vi.fn();
  return {
    returning,
    insertValues,
    insert,
    selectLimit,
    select,
    getNotificationPrefs,
    disabledChannels,
  };
});

vi.mock("@/lib/db", () => ({ db: { insert: h.insert, select: h.select } }));
vi.mock("@/lib/notifications/prefs", () => ({
  getNotificationPrefs: h.getNotificationPrefs,
  disabledChannels: h.disabledChannels,
}));

import { createNotification } from "@/lib/notifications/create";

beforeEach(() => {
  vi.clearAllMocks();
  h.selectLimit.mockResolvedValue([{ plan: "free" }]);
  h.returning.mockResolvedValue([{ id: "notif_1" }]);
  h.getNotificationPrefs.mockResolvedValue({});
  h.disabledChannels.mockReturnValue([]);
});

describe("createNotification", () => {
  it("writes an in-app row for a plan-allowed type", async () => {
    const res = await createNotification({
      tenantId: "t_1",
      userId: "u_1",
      type: "leads.site_enquiry",
      title: "Nouvelle demande",
      body: "Claire — fuite sous l'évier",
      actionUrl: "/dashboard/leads",
    });

    expect(res).toEqual({ id: "notif_1" });
    expect(h.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "t_1",
        userId: "u_1",
        type: "leads.site_enquiry",
        title: "Nouvelle demande",
        actionUrl: "/dashboard/leads",
      })
    );
  });

  it("skips a type the tenant's plan does not allow", async () => {
    h.selectLimit.mockResolvedValue([{ plan: "free" }]);
    const res = await createNotification({
      tenantId: "t_1",
      type: "leads.ai_conversation", // business-only
      title: "Nouvelle conversation",
    });
    expect(res).toBeNull();
    expect(h.insert).not.toHaveBeenCalled();
  });

  it("bypasses the plan gate with force", async () => {
    const res = await createNotification({
      tenantId: "t_1",
      type: "operator.signup",
      title: "Nouvel artisan",
      force: true,
    });
    expect(res).toEqual({ id: "notif_1" });
    expect(h.select).not.toHaveBeenCalled();
  });

  it("returns null (never throws) when the insert fails", async () => {
    h.returning.mockRejectedValue(new Error("db down"));
    const res = await createNotification({
      tenantId: "t_1",
      type: "billing.payment_failed",
      title: "Paiement échoué",
    });
    expect(res).toBeNull();
  });

  it("returns null for an unknown tenant", async () => {
    h.selectLimit.mockResolvedValue([]);
    const res = await createNotification({
      tenantId: "ghost",
      type: "account.welcome",
      title: "x",
    });
    expect(res).toBeNull();
  });

  it("skips a non-transactional type the recipient muted in-app for", async () => {
    h.disabledChannels.mockReturnValue(["in_app"]);
    const res = await createNotification({
      tenantId: "t_1",
      userId: "u_1",
      type: "leads.site_enquiry",
      title: "Nouvelle demande",
    });
    expect(res).toBeNull();
    expect(h.getNotificationPrefs).toHaveBeenCalledWith("t_1", "u_1");
    expect(h.insert).not.toHaveBeenCalled();
  });

  it("ignores in-app muting for transactional types", async () => {
    h.disabledChannels.mockReturnValue(["in_app"]);
    const res = await createNotification({
      tenantId: "t_1",
      userId: "u_1",
      type: "billing.payment_failed",
      title: "Paiement échoué",
    });
    expect(res).toEqual({ id: "notif_1" });
    expect(h.getNotificationPrefs).not.toHaveBeenCalled();
  });

  it("skips the preference check for tenant-wide notifications (no userId)", async () => {
    const res = await createNotification({
      tenantId: "t_1",
      type: "leads.site_enquiry",
      title: "Nouvelle demande",
    });
    expect(res).toEqual({ id: "notif_1" });
    expect(h.getNotificationPrefs).not.toHaveBeenCalled();
  });
});
