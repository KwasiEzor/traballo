import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { celebrate } from "@/components/shared/celebrate";
import { AppointmentActions } from "@/app/dashboard/appointments/[id]/appointment-actions";
import { updateAppointmentStatus } from "@/app/dashboard/appointments/actions/update-status";

vi.mock("@/app/dashboard/appointments/actions/update-status", () => ({
  updateAppointmentStatus: vi.fn(),
}));
vi.mock("@/components/shared/celebrate", () => ({ celebrate: vi.fn() }));
vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(updateAppointmentStatus).mockResolvedValue({ success: true, client: "sent" });
});

describe("AppointmentActions", () => {
  it("says the client was told about the confirmation", async () => {
    const user = userEvent.setup();
    render(<AppointmentActions id="appt_1" status="pending" />);
    await user.click(screen.getByRole("button", { name: /confirmer/i }));
    expect(updateAppointmentStatus).toHaveBeenCalledWith("appt_1", "confirmed");
    expect(celebrate).toHaveBeenCalledWith("Rendez-vous confirmé — client prévenu par e-mail.");
  });

  it("asks before cancelling, then says the client was told", async () => {
    const user = userEvent.setup();
    render(<AppointmentActions id="appt_1" status="confirmed" />);

    await user.click(screen.getByRole("button", { name: /^annuler$/i }));
    expect(updateAppointmentStatus).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /annuler le rendez-vous/i }));

    expect(updateAppointmentStatus).toHaveBeenCalledWith("appt_1", "cancelled");
    expect(toast.success).toHaveBeenCalledWith("Rendez-vous annulé — client prévenu par e-mail.");
  });

  it("warns when the client e-mail could not go out", async () => {
    vi.mocked(updateAppointmentStatus).mockResolvedValue({ success: true, client: "failed" });
    const user = userEvent.setup();
    render(<AppointmentActions id="appt_1" status="pending" />);
    await user.click(screen.getByRole("button", { name: /confirmer/i }));
    expect(toast.error).toHaveBeenCalledWith(
      "Statut mis à jour, mais l'e-mail au client n'a pas pu partir."
    );
  });
});
