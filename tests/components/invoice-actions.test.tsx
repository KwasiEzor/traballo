import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { InvoiceActions } from "@/app/dashboard/invoices/invoice-actions";
import { sendInvoiceReminderAction } from "@/app/dashboard/invoices/actions/send-reminder";

vi.mock("@/app/dashboard/invoices/actions/generate-pdf", () => ({ generateInvoicePDF: vi.fn() }));
vi.mock("@/app/dashboard/invoices/actions/send-invoice", () => ({ sendInvoiceEmail: vi.fn() }));
vi.mock("@/app/dashboard/invoices/actions/update-status", () => ({ updateInvoiceStatus: vi.fn() }));
vi.mock("@/app/dashboard/invoices/actions/send-reminder", () => ({
  sendInvoiceReminderAction: vi.fn(),
}));
vi.mock("@/components/shared/celebrate", () => ({ celebrate: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const invoice = (status: string, email: string | null = "claire@example.com") => ({
  id: "inv_1",
  invoiceNumber: "F-42",
  status,
  client: { name: "Claire Martin", email },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(sendInvoiceReminderAction).mockResolvedValue({
    ok: true,
    value: { sentTo: "claire@example.com" },
  });
});

describe("InvoiceActions", () => {
  it("offers Envoyer only on a draft", () => {
    render(<InvoiceActions invoice={invoice("draft")} />);
    expect(screen.getByRole("button", { name: /envoyer/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /relancer/i })).not.toBeInTheDocument();
  });

  it("offers Relancer instead of Envoyer on an overdue invoice", () => {
    render(<InvoiceActions invoice={invoice("overdue")} />);
    expect(screen.queryByRole("button", { name: /^envoyer/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /relancer/i })).toBeEnabled();
  });

  it("sends the reminder after confirmation", async () => {
    const user = userEvent.setup();
    render(<InvoiceActions invoice={invoice("sent")} />);

    await user.click(screen.getByRole("button", { name: /relancer/i }));
    await user.click(screen.getByRole("button", { name: /envoyer la relance/i }));

    expect(sendInvoiceReminderAction).toHaveBeenCalledWith("inv_1");
    expect(toast.success).toHaveBeenCalledWith("Relance envoyée à Claire Martin.");
  });

  it("shows why a reminder was refused", async () => {
    vi.mocked(sendInvoiceReminderAction).mockResolvedValue({
      ok: false,
      error: { code: "CONFLICT", message: "Une relance a déjà été envoyée aujourd'hui pour cette facture." },
    });
    const user = userEvent.setup();
    render(<InvoiceActions invoice={invoice("overdue")} />);

    await user.click(screen.getByRole("button", { name: /relancer/i }));
    await user.click(screen.getByRole("button", { name: /envoyer la relance/i }));

    expect(toast.error).toHaveBeenCalledWith(
      "Une relance a déjà été envoyée aujourd'hui pour cette facture."
    );
  });

  it("cannot remind a client without e-mail", () => {
    render(<InvoiceActions invoice={invoice("overdue", null)} />);
    expect(screen.getByRole("button", { name: /relancer/i })).toBeDisabled();
  });
});
