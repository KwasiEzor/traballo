import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { createAppointment } from "@/app/dashboard/appointments/actions/create-appointment";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));

const values = vi.fn();
const insert = vi.fn(() => ({ values }));

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
  values.mockResolvedValue(undefined);
  vi.mocked(withTenant).mockImplementation(async (_t, cb) => cb({ insert } as never));
});

describe("createAppointment — time", () => {
  it("reads the typed date and times as Paris time", async () => {
    await createAppointment({
      clientId: "",
      title: "Devis salle de bain",
      startDate: "2026-07-01",
      startTime: "09:00",
      endTime: "10:30",
      notes: "",
    });
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: new Date("2026-07-01T07:00:00.000Z"),
        endTime: new Date("2026-07-01T08:30:00.000Z"),
      })
    );
  });

  it("still refuses an end before the start", async () => {
    const res = await createAppointment({
      clientId: "",
      title: "X",
      startDate: "2026-07-01",
      startTime: "10:00",
      endTime: "09:00",
      notes: "",
    });
    expect(res).toHaveProperty("error");
    expect(values).not.toHaveBeenCalled();
  });
});
