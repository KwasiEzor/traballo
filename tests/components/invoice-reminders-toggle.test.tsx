import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { InvoiceRemindersToggle } from "@/app/dashboard/settings/invoice-reminders-toggle";
import { saveInvoiceRemindersAction } from "@/app/dashboard/settings/actions/save-invoice-reminders";

vi.mock("@/app/dashboard/settings/actions/save-invoice-reminders", () => ({
  saveInvoiceRemindersAction: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const NAME = "Relances automatiques des factures";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(saveInvoiceRemindersAction).mockImplementation(async (v) => ({
    ok: true,
    value: { enabled: v as boolean },
  }));
});

describe("InvoiceRemindersToggle", () => {
  it("turns reminders off on a Pro plan", async () => {
    const user = userEvent.setup();
    render(<InvoiceRemindersToggle enabled plan="pro" />);
    const sw = screen.getByRole("switch", { name: NAME });
    expect(sw).toHaveAttribute("aria-checked", "true");

    await user.click(sw);

    expect(saveInvoiceRemindersAction).toHaveBeenCalledWith(false);
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(toast.success).toHaveBeenCalled();
  });

  it("puts the switch back when the save fails", async () => {
    vi.mocked(saveInvoiceRemindersAction).mockResolvedValue({
      ok: false,
      error: { code: "DB_ERROR", message: "Impossible d'enregistrer" },
    });
    const user = userEvent.setup();
    render(<InvoiceRemindersToggle enabled plan="pro" />);
    const sw = screen.getByRole("switch", { name: NAME });

    await user.click(sw);

    expect(toast.error).toHaveBeenCalledWith("Impossible d'enregistrer");
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("is a Pro feature on the Free plan", () => {
    render(<InvoiceRemindersToggle enabled plan="free" />);
    const sw = screen.getByRole("switch", { name: NAME });
    expect(sw).toBeDisabled();
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("link", { name: /plan pro/i })).toHaveAttribute(
      "href",
      "/dashboard/settings?tab=abonnement"
    );
  });
});
