import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { loadAppointmentNotice } from "@/lib/appointments/notify-data";
import { notifyClientOnce } from "@/lib/appointments/notify";
import { updateAppointmentStatus } from "@/app/dashboard/appointments/actions/update-status";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));
vi.mock("@/lib/appointments/notify-data", () => ({ loadAppointmentNotice: vi.fn() }));
vi.mock("@/lib/appointments/notify", () => ({ notifyClientOnce: vi.fn() }));

const ID = "3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b";
const where = vi.fn();
const set = vi.fn(() => ({ where }));
const update = vi.fn(() => ({ set }));
const future = { appointmentId: ID, startTime: new Date(Date.now() + 86_400_000) };

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
  where.mockResolvedValue(undefined);
  vi.mocked(withTenant).mockImplementation(async (_t, cb) => cb({ update } as never));
  vi.mocked(loadAppointmentNotice).mockResolvedValue(future as never);
  vi.mocked(notifyClientOnce).mockResolvedValue("sent");
});

describe("updateAppointmentStatus", () => {
  it("confirms and tells the client", async () => {
    const res = await updateAppointmentStatus(ID, "confirmed");
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ status: "confirmed" }));
    expect(notifyClientOnce).toHaveBeenCalledWith(future, "confirmation");
    expect(res).toEqual({ success: true, client: "sent" });
  });

  it("cancels an upcoming appointment and tells the client", async () => {
    await updateAppointmentStatus(ID, "cancelled");
    expect(notifyClientOnce).toHaveBeenCalledWith(future, "cancellation");
  });

  it("says nothing to the client about a past appointment", async () => {
    vi.mocked(loadAppointmentNotice).mockResolvedValue({
      ...future,
      startTime: new Date(Date.now() - 86_400_000),
    } as never);
    const res = await updateAppointmentStatus(ID, "cancelled");
    expect(notifyClientOnce).not.toHaveBeenCalled();
    expect(res).toEqual({ success: true });
  });

  it("says nothing when marking it done", async () => {
    await updateAppointmentStatus(ID, "completed");
    expect(notifyClientOnce).not.toHaveBeenCalled();
  });

  it("validates its input", async () => {
    expect(await updateAppointmentStatus("x", "confirmed")).toHaveProperty("error");
    expect(await updateAppointmentStatus(ID, "pending" as never)).toHaveProperty("error");
    expect(withTenant).not.toHaveBeenCalled();
  });
});
