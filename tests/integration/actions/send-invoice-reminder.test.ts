import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import {
  claimReminder,
  loadInvoicePdf,
  loadReminderCandidate,
  releaseReminder,
} from "@/lib/invoices/reminder-data";
import { generateInvoicePDF } from "@/app/dashboard/invoices/actions/generate-pdf";
import { sendInvoiceReminder } from "@/lib/invoices/reminder-send";
import { sendInvoiceReminderAction } from "@/app/dashboard/invoices/actions/send-reminder";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));
vi.mock("@/lib/invoices/reminder-data", () => ({
  loadReminderCandidate: vi.fn(),
  loadInvoicePdf: vi.fn(),
  claimReminder: vi.fn(),
  releaseReminder: vi.fn(),
}));
vi.mock("@/app/dashboard/invoices/actions/generate-pdf", () => ({
  generateInvoicePDF: vi.fn(),
}));
vi.mock("@/lib/invoices/reminder-send", () => ({ sendInvoiceReminder: vi.fn() }));

const ID = "3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b";
const AUTH = {
  tenantId: "t_1",
  userId: "u_1",
  email: "artisan@example.com",
  plan: "free" as const, // manual reminders: every plan
  role: "owner" as const,
  status: "active" as const,
};
const INVOICE = {
  invoiceId: ID,
  tenantId: "t_1",
  status: "overdue",
  clientEmail: "claire@example.com",
  invoiceNumber: "F-42",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-26T08:00:00Z"));
  vi.mocked(requireAuth).mockResolvedValue(AUTH);
  vi.mocked(withTenant).mockImplementation(async (_t, cb) => cb({} as never));
  vi.mocked(loadReminderCandidate).mockResolvedValue(INVOICE as never);
  vi.mocked(claimReminder).mockResolvedValue(true);
  vi.mocked(sendInvoiceReminder).mockResolvedValue(true);
  vi.mocked(loadInvoicePdf).mockResolvedValue(Buffer.from("%PDF"));
  vi.mocked(generateInvoicePDF).mockResolvedValue({ success: true, pdfUrl: "data:x" });
});
afterEach(() => vi.useRealTimers());

describe("sendInvoiceReminderAction", () => {
  it("reminds the client now, once for today, without touching the status", async () => {
    const res = await sendInvoiceReminderAction(ID);

    expect(res).toEqual({ ok: true, value: { sentTo: "claire@example.com" } });
    expect(withTenant).toHaveBeenCalledWith("t_1", expect.any(Function));
    expect(loadReminderCandidate).toHaveBeenCalledWith(expect.anything(), ID, "t_1");
    expect(claimReminder).toHaveBeenCalledWith("t_1", ID, "manual:2026-09-26");
    expect(sendInvoiceReminder).toHaveBeenCalledWith(INVOICE, "manual", "2026-09-26");
    expect(revalidatePath).toHaveBeenCalledWith(`/dashboard/invoices/${ID}`);
  });

  it("generates the PDF first when the invoice has none, so it can be attached", async () => {
    vi.mocked(loadInvoicePdf).mockResolvedValue(null);
    await sendInvoiceReminderAction(ID);
    expect(generateInvoicePDF).toHaveBeenCalledWith(ID);
    expect(sendInvoiceReminder).toHaveBeenCalled();
  });

  it("reuses the stored PDF", async () => {
    await sendInvoiceReminderAction(ID);
    expect(loadInvoicePdf).toHaveBeenCalledWith(ID, "t_1");
    expect(generateInvoicePDF).not.toHaveBeenCalled();
  });

  it("refuses a second reminder the same day", async () => {
    vi.mocked(claimReminder).mockResolvedValue(false);
    const res = await sendInvoiceReminderAction(ID);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("CONFLICT");
    expect(sendInvoiceReminder).not.toHaveBeenCalled();
  });

  it("frees the day's slot when the e-mail fails", async () => {
    vi.mocked(sendInvoiceReminder).mockResolvedValue(false);
    const res = await sendInvoiceReminderAction(ID);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("EXTERNAL_API_ERROR");
    expect(releaseReminder).toHaveBeenCalledWith("t_1", ID, "manual:2026-09-26");
  });

  it.each([
    ["a draft", { status: "draft" }],
    ["a paid invoice", { status: "paid" }],
    ["a client without e-mail", { clientEmail: null }],
  ])("refuses %s", async (_l, patch) => {
    vi.mocked(loadReminderCandidate).mockResolvedValue({ ...INVOICE, ...patch } as never);
    const res = await sendInvoiceReminderAction(ID);
    expect(res.ok).toBe(false);
    expect(claimReminder).not.toHaveBeenCalled();
  });

  it("does not reveal another tenant's invoice", async () => {
    vi.mocked(loadReminderCandidate).mockResolvedValue(null);
    const res = await sendInvoiceReminderAction(ID);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("NOT_FOUND");
  });

  it("rejects a non-uuid id and support mode", async () => {
    expect((await sendInvoiceReminderAction("1 OR 1=1")).ok).toBe(false);
    vi.mocked(requireAuth).mockResolvedValue({ ...AUTH, impersonating: true });
    const res = await sendInvoiceReminderAction(ID);
    if (!res.ok) expect(res.error.code).toBe("FORBIDDEN");
    expect(withTenant).not.toHaveBeenCalled();
  });
});
