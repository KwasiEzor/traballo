import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { InvoiceReminderPause } from "@/app/dashboard/invoices/invoice-reminder-pause";
import { setInvoiceRemindersPausedAction } from "@/app/dashboard/invoices/actions/pause-reminders";

vi.mock("@/app/dashboard/invoices/actions/pause-reminders", () => ({
  setInvoiceRemindersPausedAction: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const NAME = "Relances automatiques pour cette facture";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(setInvoiceRemindersPausedAction).mockImplementation(async (_id, p) => ({
    ok: true,
    value: { paused: p as boolean },
  }));
});

describe("InvoiceReminderPause", () => {
  it("pauses the reminders of this invoice", async () => {
    const user = userEvent.setup();
    render(<InvoiceReminderPause invoiceId="inv_1" paused={false} enabledInSettings />);
    const sw = screen.getByRole("switch", { name: NAME });
    expect(sw).toHaveAttribute("aria-checked", "true");

    await user.click(sw);

    expect(setInvoiceRemindersPausedAction).toHaveBeenCalledWith("inv_1", true);
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(toast.success).toHaveBeenCalled();
  });

  it("points to Settings when reminders are off for the whole account", () => {
    render(<InvoiceReminderPause invoiceId="inv_1" paused={false} enabledInSettings={false} />);
    expect(screen.queryByRole("switch", { name: NAME })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /paramètres/i })).toHaveAttribute(
      "href",
      "/dashboard/settings?tab=notifications"
    );
  });
});
