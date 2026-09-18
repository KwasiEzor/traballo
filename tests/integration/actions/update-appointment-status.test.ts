import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { updateAppointmentStatus } from "@/app/dashboard/appointments/actions/update-status";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { sendEmail } from "@/lib/email/send";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn() }));

const appointmentsFindFirst = vi.fn();
const profilesFindFirst = vi.fn();
const updateWhere = vi.fn().mockResolvedValue(undefined);
const updateSet = vi.fn(() => ({ where: updateWhere }));
const txUpdate = vi.fn(() => ({ set: updateSet }));

const baseAppointment = {
  id: "apt_1",
  title: "Diagnostic chauffage",
  startTime: new Date("2026-04-20T09:00:00Z"),
  endTime: new Date("2026-04-20T10:00:00Z"),
  client: { name: "Cabinet Léon", email: "leon@example.com" },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuth).mockResolvedValue({
    tenantId: "t_1",
    userId: "u_1",
    email: "artisan@example.com",
    plan: "pro",
    role: "owner",
    status: "active",
  });
  appointmentsFindFirst.mockResolvedValue(baseAppointment);
  profilesFindFirst.mockResolvedValue({ businessName: "Menuiserie Bois & Cie", email: "artisan@example.com" });
  vi.mocked(withTenant).mockImplementation(async (_tenantId, callback) =>
    callback({
      update: txUpdate,
      query: {
        appointments: { findFirst: appointmentsFindFirst },
        artisanProfiles: { findFirst: profilesFindFirst },
      },
    } as any)
  );
  vi.mocked(sendEmail).mockResolvedValue({ success: true } as any);
});

describe("updateAppointmentStatus", () => {
  it("e-mails the client when an appointment is cancelled", async () => {
    const res = await updateAppointmentStatus("apt_1", "cancelled");

    expect(res).toEqual({ success: true });
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled" })
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "leon@example.com" })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/appointments/apt_1");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/appointments");
  });

  it("does not e-mail the client on confirmed", async () => {
    await updateAppointmentStatus("apt_1", "confirmed");
    expect(sendEmail).not.toHaveBeenCalled();
    expect(appointmentsFindFirst).not.toHaveBeenCalled();
  });

  it("does not e-mail the client on completed", async () => {
    await updateAppointmentStatus("apt_1", "completed");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("skips the e-mail when the appointment has no client e-mail", async () => {
    appointmentsFindFirst.mockResolvedValue({ ...baseAppointment, client: { name: "X", email: null } });
    await updateAppointmentStatus("apt_1", "cancelled");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("still updates the status when the cancellation e-mail fails", async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error("Resend down"));
    const res = await updateAppointmentStatus("apt_1", "cancelled");
    expect(res).toEqual({ success: true });
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled" })
    );
  });
});
