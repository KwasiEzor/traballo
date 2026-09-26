import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppointmentForm } from "@/app/dashboard/appointments/appointment-form";
import { createAppointment } from "@/app/dashboard/appointments/actions/create-appointment";

vi.mock("@/app/dashboard/appointments/actions/create-appointment", () => ({
  createAppointment: vi.fn(),
}));

const CLIENTS = [{ id: "c_1", name: "Claire Martin" }];
const BOX = "Envoyer une confirmation au client";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createAppointment).mockResolvedValue(undefined as never);
});

describe("AppointmentForm — confirmation", () => {
  it("sends a confirmation by default when a client is chosen", async () => {
    const user = userEvent.setup();
    render(<AppointmentForm clients={CLIENTS} defaultClientId="c_1" />);
    expect(screen.getByRole("checkbox", { name: BOX })).toBeChecked();

    await user.type(screen.getByLabelText("Objet du rendez-vous"), "Devis");
    await user.click(screen.getByRole("button", { name: /planifier/i }));

    expect(createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: "c_1", sendConfirmation: true })
    );
  });

  it("lets the artisan skip it", async () => {
    const user = userEvent.setup();
    render(<AppointmentForm clients={CLIENTS} defaultClientId="c_1" />);
    await user.click(screen.getByRole("checkbox", { name: BOX }));
    await user.type(screen.getByLabelText("Objet du rendez-vous"), "Devis");
    await user.click(screen.getByRole("button", { name: /planifier/i }));

    expect(createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ sendConfirmation: false })
    );
  });

  it("has nobody to confirm without a client", () => {
    render(<AppointmentForm clients={CLIENTS} />);
    expect(screen.getByRole("checkbox", { name: BOX })).toBeDisabled();
  });
});
