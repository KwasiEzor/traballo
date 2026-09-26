import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { loadAppointmentNotice } from "@/lib/appointments/notify-data";
import { notifyClientOnce } from "@/lib/appointments/notify";
import { createAppointment } from "@/app/dashboard/appointments/actions/create-appointment";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));
vi.mock("@/lib/appointments/notify-data", () => ({ loadAppointmentNotice: vi.fn() }));
vi.mock("@/lib/appointments/notify", () => ({ notifyClientOnce: vi.fn() }));

const CLIENT = "3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b";
const returning = vi.fn();
const values = vi.fn(() => ({ returning }));
const insert = vi.fn(() => ({ values }));
const NOTICE = { appointmentId: "appt_1", clientEmail: "claire@example.com" };

const input = {
  clientId: CLIENT,
  title: "Devis salle de bain",
  startDate: "2026-07-01",
  startTime: "09:00",
  endTime: "10:30",
  notes: "",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuth).mockResolvedValue({
    tenantId: "t_1",
    userId: "u_1",
    email: "a@example.com",
    plan: "free",
    role: "owner",
    status: "active",
  });
  returning.mockResolvedValue([{ id: "appt_1" }]);
  vi.mocked(withTenant).mockImplementation(async (_t, cb) => cb({ insert } as never));
  vi.mocked(loadAppointmentNotice).mockResolvedValue(NOTICE as never);
  vi.mocked(notifyClientOnce).mockResolvedValue("sent");
});

describe("createAppointment", () => {
  it("reads the typed date and times as Paris time", async () => {
    await createAppointment(input);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: new Date("2026-07-01T07:00:00.000Z"),
        endTime: new Date("2026-07-01T08:30:00.000Z"),
      })
    );
  });

  it("confirms it and tells the client when asked", async () => {
    await createAppointment({ ...input, sendConfirmation: true });
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ status: "confirmed" }));
    expect(loadAppointmentNotice).toHaveBeenCalledWith(expect.anything(), "appt_1", "t_1");
    expect(notifyClientOnce).toHaveBeenCalledWith(NOTICE, "confirmation");
    expect(redirect).toHaveBeenCalledWith("/dashboard/appointments?confirmation=sent");
  });

  it("reports a confirmation that could not go out", async () => {
    vi.mocked(notifyClientOnce).mockResolvedValue("failed");
    await createAppointment({ ...input, sendConfirmation: true });
    expect(redirect).toHaveBeenCalledWith("/dashboard/appointments?confirmation=failed");
  });

  it("stays pending and silent otherwise", async () => {
    await createAppointment(input);
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ status: "pending" }));
    expect(notifyClientOnce).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/dashboard/appointments");
  });

  it("does not confirm an appointment without client", async () => {
    await createAppointment({ ...input, clientId: "", sendConfirmation: true });
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ status: "pending" }));
    expect(notifyClientOnce).not.toHaveBeenCalled();
  });

  it("still refuses an end before the start", async () => {
    const res = await createAppointment({ ...input, startTime: "10:00", endTime: "09:00" });
    expect(res).toHaveProperty("error");
    expect(values).not.toHaveBeenCalled();
  });
});
