import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { NotificationPrefsForm } from "@/app/dashboard/settings/notification-prefs-form";
import { subscribeToPush } from "@/lib/notifications/push-client";
import { savePushSubscription } from "@/app/dashboard/settings/actions/push-subscription";
import { toggleNotificationPrefAction } from "@/app/dashboard/settings/actions/save-notification-prefs";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/lib/notifications/push-client", () => ({ subscribeToPush: vi.fn() }));
vi.mock("@/app/dashboard/settings/actions/push-subscription", () => ({
  savePushSubscription: vi.fn(),
}));
vi.mock("@/app/dashboard/settings/actions/save-notification-prefs", () => ({
  toggleNotificationPrefAction: vi.fn(),
}));

const allOn = { email: true, in_app: true, push: true, sms: true };
const allOff = { email: false, in_app: false, push: false, sms: false };
const prefs = {
  account: { ...allOn },
  billing: { ...allOn },
  invoices: { ...allOn },
  appointments: { ...allOn },
  leads: { ...allOff }, // leads/push starts off so we can toggle it on
  operator: { ...allOn },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(toggleNotificationPrefAction).mockResolvedValue({});
});

describe("NotificationPrefsForm — push toggle", () => {
  it("subscribes and saves before enabling a push toggle", async () => {
    vi.mocked(subscribeToPush).mockResolvedValue({
      endpoint: "https://push.example.com/abc",
      keys: { p256dh: "p", auth: "a" },
    });
    vi.mocked(savePushSubscription).mockResolvedValue({});

    render(<NotificationPrefsForm prefs={prefs as any} vapidPublicKey="vapid_key" />);
    const cell = screen.getByLabelText("Demandes — Push");

    await userEvent.click(cell);

    await waitFor(() => expect(toggleNotificationPrefAction).toHaveBeenCalledWith({
      category: "leads",
      channel: "push",
      enabled: true,
    }));
    expect(subscribeToPush).toHaveBeenCalledWith("vapid_key");
    expect(savePushSubscription).toHaveBeenCalledWith({
      endpoint: "https://push.example.com/abc",
      keys: { p256dh: "p", auth: "a" },
    });
  });

  it("shows an error and never saves the preference when the browser subscription fails", async () => {
    vi.mocked(subscribeToPush).mockRejectedValue(new Error("Autorisation refusée pour les notifications."));

    render(<NotificationPrefsForm prefs={prefs as any} vapidPublicKey="vapid_key" />);
    const cell = screen.getByLabelText("Demandes — Push");

    await userEvent.click(cell);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Autorisation refusée pour les notifications.")
    );
    expect(savePushSubscription).not.toHaveBeenCalled();
    expect(toggleNotificationPrefAction).not.toHaveBeenCalled();
  });

  it("does not attempt a subscription when turning a push toggle off", async () => {
    render(<NotificationPrefsForm prefs={prefs as any} vapidPublicKey="vapid_key" />);
    const cell = screen.getByLabelText("Abonnement — Push"); // billing starts on

    await userEvent.click(cell);

    await waitFor(() => expect(toggleNotificationPrefAction).toHaveBeenCalledWith({
      category: "billing",
      channel: "push",
      enabled: false,
    }));
    expect(subscribeToPush).not.toHaveBeenCalled();
  });
});
