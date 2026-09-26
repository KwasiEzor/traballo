import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@react-email/render";

const h = vi.hoisted(() => ({
  invoiceFindFirst: vi.fn(),
  profileFindFirst: vi.fn(),
  sendEmail: vi.fn(),
  updateInvoiceStatus: vi.fn(),
  generateInvoicePDF: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn().mockResolvedValue({ tenantId: "t_1" }),
}));
vi.mock("@/lib/db/tenant", () => ({
  createTenantClient: () => ({
    query: {
      invoices: { findFirst: h.invoiceFindFirst },
      artisanProfiles: { findFirst: h.profileFindFirst },
    },
  }),
}));
vi.mock("@/lib/email/send", () => ({ sendEmail: h.sendEmail }));
vi.mock("@/app/dashboard/invoices/actions/update-status", () => ({
  updateInvoiceStatus: h.updateInvoiceStatus,
}));
vi.mock("@/app/dashboard/invoices/actions/generate-pdf", () => ({
  generateInvoicePDF: h.generateInvoicePDF,
}));

import { sendInvoiceEmail } from "@/app/dashboard/invoices/actions/send-invoice";

const PDF = `data:application/pdf;base64,${Buffer.from("%PDF-1.4").toString("base64")}`;
const INVOICE = {
  id: "inv_1",
  invoiceNumber: "F-42",
  status: "draft",
  total: "120.00",
  dueDate: "2026-10-01",
  pdfUrl: PDF,
  client: { name: "Claire Martin", email: "claire@example.com" },
};

beforeEach(() => {
  vi.clearAllMocks();
  h.invoiceFindFirst.mockResolvedValue(INVOICE);
  h.profileFindFirst.mockResolvedValue({
    businessName: "Plomberie Durand",
    email: "artisan@example.com",
    iban: "FR7630006000011234567890189",
  });
  h.sendEmail.mockResolvedValue({ id: "email_1" });
  h.updateInvoiceStatus.mockResolvedValue({ success: true });
  h.generateInvoicePDF.mockResolvedValue({ success: true, pdfUrl: PDF });
});

describe("sendInvoiceEmail", () => {
  it("attaches the PDF, shows the IBAN and sends as the artisan", async () => {
    const res = await sendInvoiceEmail("inv_1");
    expect(res).toEqual({ success: true });

    const mail = h.sendEmail.mock.calls[0][0];
    expect(mail).toMatchObject({
      to: "claire@example.com",
      replyTo: "artisan@example.com",
      from: expect.stringContaining("Plomberie Durand via Traballo"),
      attachments: [{ filename: "facture-F-42.pdf", content: expect.any(Buffer) }],
    });
    const html = await render(mail.react);
    expect(html).toContain("FR76 3000 6000 0112 3456 7890 189");
    expect(html).not.toContain("data:application/pdf");
    expect(h.generateInvoicePDF).not.toHaveBeenCalled();
    expect(h.updateInvoiceStatus).toHaveBeenCalledWith("inv_1", "sent");
  });

  it("generates the PDF first when there is none yet", async () => {
    h.invoiceFindFirst.mockResolvedValue({ ...INVOICE, pdfUrl: null });
    await sendInvoiceEmail("inv_1");
    expect(h.generateInvoicePDF).toHaveBeenCalledWith("inv_1");
    expect(h.sendEmail.mock.calls[0][0].attachments).toHaveLength(1);
  });

  it("never pulls an overdue invoice back to sent", async () => {
    h.invoiceFindFirst.mockResolvedValue({ ...INVOICE, status: "overdue" });
    await sendInvoiceEmail("inv_1");
    expect(h.updateInvoiceStatus).not.toHaveBeenCalled();
  });

  it("refuses a client without e-mail", async () => {
    h.invoiceFindFirst.mockResolvedValue({
      ...INVOICE,
      client: { name: "X", email: null },
    });
    const res = await sendInvoiceEmail("inv_1");
    expect(res).toHaveProperty("error");
    expect(h.sendEmail).not.toHaveBeenCalled();
  });
});
