import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ runAppointmentReminders: vi.fn() }));
vi.mock("@/lib/appointments/reminder-job", () => ({
  runAppointmentReminders: h.runAppointmentReminders,
}));

import { GET } from "@/app/api/cron/appointment-reminders/route";

function call(authorization?: string): Promise<Response> {
  return GET(
    new Request("http://localhost/api/cron/appointment-reminders", {
      headers: authorization ? { authorization } : {},
    })
  );
}

const SUMMARY = { day: "2026-07-01", appointments: 1, clientReminders: 1, clientFailed: 0, agendas: 1 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CRON_SECRET", "s3cret-cron-token");
  h.runAppointmentReminders.mockResolvedValue(SUMMARY);
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/cron/appointment-reminders", () => {
  it("runs the job for Vercel Cron's bearer token", async () => {
    const res = await call("Bearer s3cret-cron-token");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(SUMMARY);
  });

  it("refuses a wrong token and stays closed without CRON_SECRET", async () => {
    expect((await call("Bearer nope")).status).toBe(401);
    vi.stubEnv("CRON_SECRET", "");
    expect((await call("Bearer ")).status).toBe(503);
    expect(h.runAppointmentReminders).not.toHaveBeenCalled();
  });

  it("reports a failed run as 500", async () => {
    h.runAppointmentReminders.mockRejectedValue(new Error("db down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await call("Bearer s3cret-cron-token");
    spy.mockRestore();
    expect(res.status).toBe(500);
  });
});
