import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ runInvoiceReminders: vi.fn() }));
vi.mock("@/lib/invoices/reminder-job", () => ({
  runInvoiceReminders: h.runInvoiceReminders,
}));

import { GET } from "@/app/api/cron/invoice-reminders/route";

function call(authorization?: string): Promise<Response> {
  return GET(
    new Request("http://localhost/api/cron/invoice-reminders", {
      headers: authorization ? { authorization } : {},
    })
  );
}

const SUMMARY = {
  today: "2026-09-08",
  candidates: 2,
  markedOverdue: 1,
  remindersSent: 1,
  remindersFailed: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CRON_SECRET", "s3cret-cron-token");
  h.runInvoiceReminders.mockResolvedValue(SUMMARY);
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/cron/invoice-reminders", () => {
  it("runs the job for Vercel Cron's bearer token", async () => {
    const res = await call("Bearer s3cret-cron-token");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(SUMMARY);
    expect(h.runInvoiceReminders).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["no token", undefined],
    ["a wrong token", "Bearer nope"],
    ["the secret without the Bearer scheme", "s3cret-cron-token"],
  ])("refuses %s", async (_l, auth) => {
    const res = await call(auth);
    expect(res.status).toBe(401);
    expect(h.runInvoiceReminders).not.toHaveBeenCalled();
  });

  it("stays closed when CRON_SECRET is not configured", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const res = await call("Bearer ");
    expect(res.status).toBe(503);
    expect(h.runInvoiceReminders).not.toHaveBeenCalled();
  });

  it("reports a failed run as 500 (visible in Vercel's cron logs)", async () => {
    h.runInvoiceReminders.mockRejectedValue(new Error("db down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await call("Bearer s3cret-cron-token");
    spy.mockRestore();
    expect(res.status).toBe(500);
  });
});
