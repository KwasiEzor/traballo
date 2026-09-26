import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@react-email/render";

const h = vi.hoisted(() => ({
  claimDelivery: vi.fn(),
  releaseDelivery: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/notifications/ledger", () => ({
  claimDelivery: h.claimDelivery,
  releaseDelivery: h.releaseDelivery,
}));
vi.mock("@/lib/email/send", () => ({ sendEmail: h.sendEmail }));

import { notifyClientOnce } from "@/lib/appointments/notify";
import type { AppointmentNotice } from "@/lib/appointments/notify-data";

const appt: AppointmentNotice = {
  appointmentId: "appt_1",
  tenantId: "t_1",
  plan: "pro",
  status: "confirmed",
  title: "Devis salle de bain",
  startTime: new Date("2026-07-01T07:00:00Z"),
  endTime: new Date("2026-07-01T08:30:00Z"),
  clientName: "Claire Martin",
  clientEmail: "claire@example.com",
  clientAddress: "12 rue des Lilas, Lyon",
  businessName: "Plomberie Durand",
  artisanEmail: "artisan@example.com",
  artisanPhone: "06 12 34 56 78",
  logoUrl: null,
  primaryColor: "#0f766e",
};

const key = (kind: string) => ({
  tenantId: "t_1",
  entityType: "appointment",
  entityId: "appt_1",
  kind,
  channel: "email",
});

beforeEach(() => {
  vi.clearAllMocks();
  h.claimDelivery.mockResolvedValue(true);
  h.sendEmail.mockResolvedValue({ id: "email_1" });
});

describe("notifyClientOnce", () => {
  it("confirms once, white-label, with a calendar file", async () => {
    expect(await notifyClientOnce(appt, "confirmation")).toBe("sent");
    expect(h.claimDelivery).toHaveBeenCalledWith(key("confirmation"));
    const mail = h.sendEmail.mock.calls[0][0];
    expect(mail).toMatchObject({
      to: "claire@example.com",
      replyTo: "artisan@example.com",
      from: expect.stringContaining("Plomberie Durand via Traballo"),
      subject: "Rendez-vous confirmé — Plomberie Durand",
      attachments: [{ filename: "rendez-vous.ics", content: expect.stringContaining("METHOD:PUBLISH") }],
    });
    expect(mail.attachments[0].content).toContain("LOCATION:12 rue des Lilas\\, Lyon");
    expect(await render(mail.react)).toContain("09:00 – 10:30");
  });

  it("cancels the calendar event too", async () => {
    await notifyClientOnce(appt, "cancellation");
    const mail = h.sendEmail.mock.calls[0][0];
    expect(mail.subject).toBe("Rendez-vous annulé — Plomberie Durand");
    expect(mail.attachments[0].content).toContain("METHOD:CANCEL");
  });

  it("reminds the day before, without attachment", async () => {
    await notifyClientOnce(appt, "reminder");
    expect(h.claimDelivery).toHaveBeenCalledWith(key("reminder_j1"));
    const mail = h.sendEmail.mock.calls[0][0];
    expect(mail.subject).toBe("Rappel : rendez-vous demain avec Plomberie Durand");
    expect(mail.attachments).toBeUndefined();
  });

  it("skips a client without e-mail, or a notice already sent", async () => {
    expect(await notifyClientOnce({ ...appt, clientEmail: null }, "confirmation")).toBe("skipped");
    expect(h.claimDelivery).not.toHaveBeenCalled();
    h.claimDelivery.mockResolvedValue(false);
    expect(await notifyClientOnce(appt, "confirmation")).toBe("skipped");
    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("releases the claim when the e-mail fails, and never throws", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    h.sendEmail.mockResolvedValue({ error: "domain not verified" });
    expect(await notifyClientOnce(appt, "confirmation")).toBe("failed");
    h.sendEmail.mockRejectedValue(new Error("down"));
    expect(await notifyClientOnce(appt, "cancellation")).toBe("failed");
    spy.mockRestore();
    expect(h.releaseDelivery).toHaveBeenCalledWith(key("confirmation"));
    expect(h.releaseDelivery).toHaveBeenCalledWith(key("cancellation"));
  });
});
