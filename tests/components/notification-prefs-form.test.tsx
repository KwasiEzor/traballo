import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { NotificationPrefsForm } from "@/app/dashboard/settings/notification-prefs-form";
import { saveNotificationPrefsAction } from "@/app/dashboard/settings/actions/save-notification-prefs";

vi.mock("@/app/dashboard/settings/actions/save-notification-prefs", () => ({
  saveNotificationPrefsAction: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Radix Switch measures itself; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const PREFS = {
  leads: { in_app: true, email: true },
  invoices: { in_app: true, email: true },
  appointments: { in_app: false, email: true },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(saveNotificationPrefsAction).mockImplementation(async (p) => ({
    ok: true,
    value: p as typeof PREFS,
  }));
});

describe("NotificationPrefsForm", () => {
  it("shows one switch per channel the plan can receive", () => {
    render(<NotificationPrefsForm prefs={PREFS} plan="free" />);
    expect(
      screen.getByRole("switch", { name: "Rendez-vous — Dans l'app" })
    ).toHaveAttribute("aria-checked", "false");
    expect(
      screen.getByRole("switch", { name: "Factures — Dans l'app" })
    ).toHaveAttribute("aria-checked", "true");
    // Free plan: no invoice email exists yet, so no switch for it.
    expect(
      screen.queryByRole("switch", { name: "Factures — E-mail" })
    ).not.toBeInTheDocument();
  });

  it("shows the lead email as always on", () => {
    render(<NotificationPrefsForm prefs={PREFS} plan="free" />);
    const email = screen.getByRole("switch", {
      name: "Demandes de contact — E-mail",
    });
    expect(email).toHaveAttribute("aria-checked", "true");
    expect(email).toBeDisabled();
    expect(screen.getByText(/toujours envoyé/i)).toBeInTheDocument();
  });

  it("saves the edited prefs", async () => {
    const user = userEvent.setup();
    render(<NotificationPrefsForm prefs={PREFS} plan="pro" />);

    await user.click(screen.getByRole("switch", { name: "Factures — E-mail" }));
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    expect(saveNotificationPrefsAction).toHaveBeenCalledWith({
      ...PREFS,
      invoices: { in_app: true, email: false },
    });
    expect(toast.success).toHaveBeenCalled();
  });

  it("reports a failed save", async () => {
    vi.mocked(saveNotificationPrefsAction).mockResolvedValue({
      ok: false,
      error: { code: "DB_ERROR", message: "Impossible d'enregistrer" },
    });
    const user = userEvent.setup();
    render(<NotificationPrefsForm prefs={PREFS} plan="pro" />);

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    expect(toast.error).toHaveBeenCalledWith("Impossible d'enregistrer");
  });
});
