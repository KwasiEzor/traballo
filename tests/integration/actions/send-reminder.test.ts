import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { sendInvoiceReminder } from "@/app/dashboard/invoices/actions/send-reminder";
import { requireAuth } from "@/lib/auth";
import { createTenantClient } from "@/lib/db/tenant";
import { sendEmail } from "@/lib/email/send";
import { createNotification } from "@/lib/notifications/create";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ createTenantClient: vi.fn() }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/notifications/create", () => ({ createNotification: vi.fn() }));

const invoiceFindFirst = vi.fn();
const profileFindFirst = vi.fn();

const baseInvoice = {
  id: "inv_1",
  invoiceNumber: "2026-0042",
  status: "overdue",
  dueDate: "2026-01-01",
  total: "100.00",
  pdfUrl: "https://blob.example.com/inv.pdf",
  client: { name: "Cabinet Léon", email: "leon@example.com" },
};

const baseProfile = {
  businessName: "Menuiserie Bois & Cie",
  email: "artisan@example.com",
  invoiceReminderTemplate: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuth).mockResolvedValue({
    tenantId: "t_1",
    userId: "u_1",
    email: "artisan@example.com",
    plan: "pro",
    role: "owner",
    status: "active",
  });
  invoiceFindFirst.mockResolvedValue(baseInvoice);
  profileFindFirst.mockResolvedValue(baseProfile);
  vi.mocked(createTenantClient).mockReturnValue({
    query: {
      invoices: { findFirst: invoiceFindFirst },
      artisanProfiles: { findFirst: profileFindFirst },
    },
  } as any);
  vi.mocked(sendEmail).mockResolvedValue({ success: true } as any);
  vi.mocked(createNotification).mockResolvedValue({ id: "n_1" });
});

describe("sendInvoiceReminder", () => {
  it("sends the reminder and notifies", async () => {
    const res = await sendInvoiceReminder("inv_1");

    expect(res).toEqual({ success: true });
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "leon@example.com",
        replyTo: "artisan@example.com",
      })
    );
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "t_1", type: "invoices.reminder_sent" })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invoices/inv_1");
  });

  it("blocks a free-plan tenant", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      tenantId: "t_1",
      userId: "u_1",
      email: "artisan@example.com",
      plan: "free",
      role: "owner",
      status: "active",
    });

    const res = await sendInvoiceReminder("inv_1");

    expect(res).toEqual({
      error: "Les relances de factures sont réservées aux plans Pro et Business.",
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a non-reminderable invoice", async () => {
    invoiceFindFirst.mockResolvedValue({ ...baseInvoice, status: "draft" });
    const res = await sendInvoiceReminder("inv_1");
    expect(res).toEqual({ error: "Cette facture ne peut pas être relancée." });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a client without an e-mail", async () => {
    invoiceFindFirst.mockResolvedValue({
      ...baseInvoice,
      client: { name: "X", email: null },
    });
    const res = await sendInvoiceReminder("inv_1");
    expect(res).toEqual({ error: "Ce client n'a pas d'adresse e-mail." });
  });

  it("returns the email error instead of throwing", async () => {
    vi.mocked(sendEmail).mockResolvedValue({ error: "Resend down" } as any);
    const res = await sendInvoiceReminder("inv_1");
    expect(res).toEqual({ error: "Resend down" });
    expect(createNotification).not.toHaveBeenCalled();
  });
});
