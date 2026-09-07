import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const where = vi.fn();
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));
  return { where, select };
});

vi.mock("@/lib/db", () => ({ db: { select: h.select } }));

import {
  tenantLeadCapReached,
  leadDailyCap,
  startOfUtcDay,
} from "@/lib/security/lead-cap";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("leadDailyCap", () => {
  it("defaults to 30", () => {
    vi.stubEnv("SITE_LEAD_DAILY_CAP", "");
    expect(leadDailyCap()).toBe(30);
  });

  it("honours a valid override", () => {
    vi.stubEnv("SITE_LEAD_DAILY_CAP", "5");
    expect(leadDailyCap()).toBe(5);
  });

  it("ignores a non-positive or non-integer override", () => {
    vi.stubEnv("SITE_LEAD_DAILY_CAP", "-2");
    expect(leadDailyCap()).toBe(30);
    vi.stubEnv("SITE_LEAD_DAILY_CAP", "abc");
    expect(leadDailyCap()).toBe(30);
  });
});

describe("startOfUtcDay", () => {
  it("zeroes the time component in UTC", () => {
    const d = startOfUtcDay(new Date("2026-09-07T15:42:10Z"));
    expect(d.toISOString()).toBe("2026-09-07T00:00:00.000Z");
  });
});

describe("tenantLeadCapReached", () => {
  it("is false below the cap", async () => {
    vi.stubEnv("SITE_LEAD_DAILY_CAP", "30");
    h.where.mockResolvedValue([{ value: 12 }]);
    expect(await tenantLeadCapReached("t_1")).toBe(false);
  });

  it("is true at or above the cap", async () => {
    vi.stubEnv("SITE_LEAD_DAILY_CAP", "30");
    h.where.mockResolvedValue([{ value: 30 }]);
    expect(await tenantLeadCapReached("t_1")).toBe(true);
  });

  it("fails open on a DB error", async () => {
    h.where.mockRejectedValue(new Error("db down"));
    expect(await tenantLeadCapReached("t_1")).toBe(false);
  });
});
