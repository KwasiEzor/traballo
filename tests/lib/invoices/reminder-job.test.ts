import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@react-email/render";

const h = vi.hoisted(() => ({
  findReminderCandidates: vi.fn(),
  sentReminderKinds: vi.fn(),
  markOverdue: vi.fn(),
  claimReminder: vi.fn(),
  releaseReminder: vi.fn(),
  loadInvoicePdf: vi.fn(),
  sendEmail: vi.fn(),
  createNotification: vi.fn(),
}));

vi.mock("@/lib/invoices/reminder-data", () => ({
  findReminderCandidates: h.findReminderCandidates,
  sentReminderKinds: h.sentReminderKinds,
  markOverdue: h.markOverdue,
  claimReminder: h.claimReminder,
  releaseReminder: h.releaseReminder,
  loadInvoicePdf: h.loadInvoicePdf,
}));
vi.mock("@/lib/email/send", () => ({ sendEmail: h.sendEmail }));
vi.mock("@/lib/notifications/create", () => ({
  createNotification: h.createNotification,
}));

import { runInvoiceReminders } from "@/lib/invoices/reminder-job";
import type { ReminderCandidate } from "@/lib/invoices/reminder-data";

// 07:00 in Paris on 2026-09-08 = J+7 for an invoice due on 2026-09-01.
const J7 = new Date("2026-09-08T05:00:00Z");

const invoice: ReminderCandidate = {
  invoiceId: "inv_1",
  tenantId: "t_1",
  plan: "pro",
  status: "sent",
  invoiceNumber: "F-42",
  total: "120.00",
  dueDate: "2026-09-01",
  clientName: "Claire Martin",
  clientEmail: "claire@example.com",
  businessName: "Plomberie Durand",
  artisanEmail: "artisan@example.com",
  artisanPhone: "06 12 34 56 78",
  logoUrl: null,
  primaryColor: "#0f766e",
  iban: "FR7630006000011234567890189",
  remindersEnabled: true,
  remindersPaused: false,
};

function given(...rows: Partial<ReminderCandidate>[]) {
  h.findReminderCandidates.mockResolvedValue(rows.map((r) => ({ ...invoice, ...r })));
}

beforeEach(() => {
  vi.clearAllMocks();
  given({});
  h.sentReminderKinds.mockResolvedValue(new Map());
  h.markOverdue.mockResolvedValue(true);
  h.claimReminder.mockResolvedValue(true);
  h.loadInvoicePdf.mockResolvedValue(Buffer.from("%PDF-1.4"));
  h.sendEmail.mockResolvedValue({ id: "email_1" });
  h.createNotification.mockResolvedValue({ id: "n_1" });
});

const types = () => h.createNotification.mock.calls.map((c) => c[0].type);

describe("runInvoiceReminders — overdue status", () => {
  it("marks a sent invoice overdue and tells the artisan (in-app + e-mail)", async () => {
    const summary = await runInvoiceReminders(J7);

    expect(h.findReminderCandidates).toHaveBeenCalledWith("2026-09-08");
    expect(h.markOverdue).toHaveBeenCalledWith("inv_1", "t_1");
    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "t_1",
        type: "invoices.overdue",
        title: "Facture F-42 en retard",
        actionUrl: "/dashboard/invoices/inv_1",
        email: expect.objectContaining({ subject: "Facture F-42 en retard de paiement" }),
      })
    );
    expect(summary.markedOverdue).toBe(1);
  });

  it("does not re-announce an invoice already overdue", async () => {
    given({ status: "overdue" });
    await runInvoiceReminders(J7);
    expect(h.markOverdue).not.toHaveBeenCalled();
    expect(types()).not.toContain("invoices.overdue");
  });

  it("stays silent when a concurrent run already flipped the status", async () => {
    h.markOverdue.mockResolvedValue(false);
    await runInvoiceReminders(J7);
    expect(types()).not.toContain("invoices.overdue");
  });
});

describe("runInvoiceReminders — client reminders", () => {
  it("sends the J+7 reminder, white-label, PDF attached, reply-to the artisan", async () => {
    const summary = await runInvoiceReminders(J7);

    expect(h.claimReminder).toHaveBeenCalledWith("t_1", "inv_1", "reminder_j7");
    expect(h.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "claire@example.com",
        replyTo: "artisan@example.com",
        from: expect.stringContaining("Plomberie Durand via Traballo"),
        subject: "Rappel : facture F-42 — Plomberie Durand",
        attachments: [
          { filename: "facture-F-42.pdf", content: expect.any(Buffer) },
        ],
      })
    );
    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "invoices.reminder_sent",
        title: "Relance envoyée : facture F-42",
        actionUrl: "/dashboard/invoices/inv_1",
      })
    );
    expect(summary.remindersSent).toBe(1);
  });

  it("tells the client how to pay when the artisan has an IBAN", async () => {
    await runInvoiceReminders(J7);
    const html = await render(h.sendEmail.mock.calls[0][0].react);
    expect(html).toContain("FR76 3000 6000 0112 3456 7890 189");
  });

  it("sends without attachment when the invoice has no PDF", async () => {
    h.loadInvoicePdf.mockResolvedValue(null);
    await runInvoiceReminders(J7);
    expect(h.sendEmail.mock.calls[0][0].attachments).toBeUndefined();
  });

  it.each([
    ["on the Free plan", { plan: "free" as const }],
    ["when the artisan turned reminders off", { remindersEnabled: false }],
    ["when the client has no e-mail", { clientEmail: null }],
    ["when the artisan paused this invoice", { remindersPaused: true }],
  ])("sends nothing %s (but still marks overdue)", async (_l, row) => {
    given(row);
    await runInvoiceReminders(J7);
    expect(h.markOverdue).toHaveBeenCalled();
    expect(h.claimReminder).not.toHaveBeenCalled();
    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("sends nothing before J+7", async () => {
    given({ dueDate: "2026-09-05" });
    await runInvoiceReminders(J7);
    expect(h.claimReminder).not.toHaveBeenCalled();
  });

  it("does not repeat a reminder already in the ledger", async () => {
    h.sentReminderKinds.mockResolvedValue(new Map([["inv_1", new Set(["reminder_j7"])]]));
    await runInvoiceReminders(J7);
    expect(h.claimReminder).not.toHaveBeenCalled();
  });

  it("backs off when another run holds the claim", async () => {
    h.claimReminder.mockResolvedValue(false);
    await runInvoiceReminders(J7);
    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("releases the claim when the e-mail fails, so tomorrow retries", async () => {
    h.sendEmail.mockResolvedValue({ error: "domain not verified" });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const summary = await runInvoiceReminders(J7);
    spy.mockRestore();

    expect(h.releaseReminder).toHaveBeenCalledWith("t_1", "inv_1", "reminder_j7");
    expect(types()).not.toContain("invoices.reminder_sent");
    expect(summary).toMatchObject({ remindersSent: 0, remindersFailed: 1 });
  });

  it("keeps going after one invoice fails", async () => {
    given({}, { invoiceId: "inv_2", invoiceNumber: "F-43" });
    h.sendEmail
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce({ id: "email_2" });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const summary = await runInvoiceReminders(J7);
    spy.mockRestore();

    expect(summary).toMatchObject({ candidates: 2, remindersSent: 1, remindersFailed: 1 });
  });
});
