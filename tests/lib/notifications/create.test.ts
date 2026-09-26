import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const returning = vi.fn();
  const insertValues = vi.fn(() => ({ returning }));
  const insert = vi.fn(() => ({ values: insertValues }));
  const selectLimit = vi.fn();
  const selectWhere = vi.fn(() => ({ limit: selectLimit }));
  const selectFrom = vi.fn(() => ({ where: selectWhere }));
  const select = vi.fn(() => ({ from: selectFrom }));
  return { returning, insertValues, insert, selectLimit, select };
});

vi.mock("@/lib/db", () => ({ db: { insert: h.insert, select: h.select } }));
vi.mock("@/lib/notifications/prefs", () => ({ disabledChannelsFor: vi.fn() }));
vi.mock("@/lib/notifications/email", () => ({ sendArtisanEmail: vi.fn() }));

import { createNotification } from "@/lib/notifications/create";
import { disabledChannelsFor } from "@/lib/notifications/prefs";
import { sendArtisanEmail } from "@/lib/notifications/email";

beforeEach(() => {
  vi.clearAllMocks();
  h.selectLimit.mockResolvedValue([{ plan: "free" }]);
  h.returning.mockResolvedValue([{ id: "notif_1" }]);
  vi.mocked(disabledChannelsFor).mockResolvedValue([]);
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

  it("skips the feed row when the recipient turned in-app off", async () => {
    vi.mocked(disabledChannelsFor).mockResolvedValue(["in_app"]);
    const res = await createNotification({
      tenantId: "t_1",
      userId: "u_1",
      type: "leads.site_enquiry",
      title: "Nouvelle demande",
    });
    expect(res).toBeNull();
    expect(disabledChannelsFor).toHaveBeenCalledWith("t_1", "u_1", "leads");
    expect(h.insert).not.toHaveBeenCalled();
  });

  it("resolves a tenant-wide notification against the tenant's prefs", async () => {
    await createNotification({
      tenantId: "t_1",
      type: "invoices.paid",
      title: "Facture payée",
    });
    expect(disabledChannelsFor).toHaveBeenCalledWith("t_1", null, "invoices");
    expect(h.insert).toHaveBeenCalledTimes(1);
  });

  it("keeps a transactional notification in the feed whatever the prefs", async () => {
    vi.mocked(disabledChannelsFor).mockResolvedValue(["in_app", "email"]);
    const res = await createNotification({
      tenantId: "t_1",
      type: "billing.payment_failed",
      title: "Paiement échoué",
    });
    expect(res).toEqual({ id: "notif_1" });
  });

  it("writes no feed row for a type without an in-app channel", async () => {
    const res = await createNotification({
      tenantId: "t_1",
      type: "account.welcome", // email only
      title: "Bienvenue",
    });
    expect(res).toBeNull();
    expect(h.insert).not.toHaveBeenCalled();
  });

  describe("e-mail channel", () => {
    const overdue = {
      tenantId: "t_1",
      type: "invoices.overdue" as const, // in_app + email, Pro+
      title: "Facture F-42 en retard",
      body: "Claire Martin — 120,00 € TTC",
      actionUrl: "/dashboard/invoices/inv_1",
      email: { subject: "Facture F-42 en retard de paiement", cta: "Voir la facture" },
    };

    beforeEach(() => {
      h.selectLimit.mockResolvedValue([{ plan: "pro" }]);
    });

    it("e-mails the artisan when they kept the channel on", async () => {
      const res = await createNotification(overdue);
      expect(res).toEqual({ id: "notif_1" });
      expect(sendArtisanEmail).toHaveBeenCalledWith(
        "t_1",
        expect.objectContaining({ subject: "Facture F-42 en retard de paiement" })
      );
    });

    it("respects an artisan who turned the e-mail off", async () => {
      vi.mocked(disabledChannelsFor).mockResolvedValue(["email"]);
      const res = await createNotification(overdue);
      expect(sendArtisanEmail).not.toHaveBeenCalled();
      expect(res).toEqual({ id: "notif_1" }); // in-app still written
    });

    it("still e-mails when only the in-app notice is off", async () => {
      vi.mocked(disabledChannelsFor).mockResolvedValue(["in_app"]);
      const res = await createNotification(overdue);
      expect(sendArtisanEmail).toHaveBeenCalledTimes(1);
      expect(res).toBeNull();
      expect(h.insert).not.toHaveBeenCalled();
    });

    it("sends no e-mail unless the caller provides one", async () => {
      const { email: _email, ...inAppOnly } = overdue;
      await createNotification(inAppOnly);
      expect(sendArtisanEmail).not.toHaveBeenCalled();
    });

    it("sends no e-mail for a type without an e-mail channel", async () => {
      await createNotification({
        ...overdue,
        type: "invoices.reminder_sent", // in_app only
      });
      expect(sendArtisanEmail).not.toHaveBeenCalled();
    });
  });
});
