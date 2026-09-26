import { beforeEach, describe, expect, it, vi } from "vitest";
import { withTenant } from "@/lib/db/tenant";
import {
  disabledChannels,
  disabledChannelsFor,
  getNotificationPrefs,
  mergePrefs,
  readPrefs,
  saveNotificationPrefs,
  writePrefs,
} from "@/lib/notifications/prefs";

const h = vi.hoisted(() => {
  const limit = vi.fn();
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.from = vi.fn(() => chain);
  chain.innerJoin = vi.fn(() => chain);
  chain.where = vi.fn(() => chain);
  chain.limit = limit;
  const select = vi.fn(() => chain);
  return { chain, limit, select };
});

vi.mock("@/lib/db", () => ({ db: { select: h.select } }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));

const ALL_ON = {
  leads: { in_app: true, email: true },
  invoices: { in_app: true, email: true },
  appointments: { in_app: true, email: true },
};

beforeEach(() => {
  vi.clearAllMocks();
  h.limit.mockResolvedValue([]);
});

describe("mergePrefs", () => {
  it("defaults every channel to on when nothing is stored", () => {
    expect(mergePrefs([])).toEqual(ALL_ON);
  });

  it("applies stored rows and ignores unknown categories", () => {
    expect(
      mergePrefs([
        { category: "invoices", inApp: false, email: true },
        { category: "billing", inApp: false, email: false },
      ])
    ).toEqual({ ...ALL_ON, invoices: { in_app: false, email: true } });
  });
});

describe("disabledChannels", () => {
  it("lists the channels turned off", () => {
    expect(disabledChannels({ in_app: false, email: true })).toEqual(["in_app"]);
    expect(disabledChannels({ in_app: true, email: true })).toEqual([]);
  });
});

describe("readPrefs / writePrefs", () => {
  it("reads the user's rows and merges defaults", async () => {
    const where = vi.fn().mockResolvedValue([
      { category: "leads", inApp: false, email: true },
    ]);
    const tx = { select: vi.fn(() => ({ from: vi.fn(() => ({ where })) })) };

    const prefs = await readPrefs(tx as any, "t_1", "u_1");

    expect(where).toHaveBeenCalledTimes(1);
    expect(prefs).toEqual({ ...ALL_ON, leads: { in_app: false, email: true } });
  });

  it("upserts one row per configurable category for this user", async () => {
    const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
    const values = vi.fn(() => ({ onConflictDoUpdate }));
    const tx = { insert: vi.fn(() => ({ values })) };

    await writePrefs(tx as any, "t_1", "u_1", {
      ...ALL_ON,
      appointments: { in_app: true, email: false },
    });

    expect(values).toHaveBeenCalledWith([
      { tenantId: "t_1", userId: "u_1", category: "leads", inApp: true, email: true },
      { tenantId: "t_1", userId: "u_1", category: "invoices", inApp: true, email: true },
      { tenantId: "t_1", userId: "u_1", category: "appointments", inApp: true, email: false },
    ]);
    expect(onConflictDoUpdate).toHaveBeenCalledTimes(1);
  });

  it("runs reads and writes inside the tenant scope", async () => {
    vi.mocked(withTenant).mockResolvedValue(ALL_ON as never);
    await getNotificationPrefs("t_1", "u_1");
    await saveNotificationPrefs("t_1", "u_1", ALL_ON);
    expect(withTenant).toHaveBeenNthCalledWith(1, "t_1", expect.any(Function));
    expect(withTenant).toHaveBeenNthCalledWith(2, "t_1", expect.any(Function));
  });
});

describe("disabledChannelsFor (delivery time)", () => {
  it("skips the lookup for a category the user cannot configure", async () => {
    expect(await disabledChannelsFor("t_1", "u_1", "billing")).toEqual([]);
    expect(h.select).not.toHaveBeenCalled();
  });

  it("returns what the recipient turned off", async () => {
    h.limit.mockResolvedValue([{ inApp: false, email: true }]);
    expect(await disabledChannelsFor("t_1", "u_1", "leads")).toEqual(["in_app"]);
    expect(h.chain.innerJoin).not.toHaveBeenCalled();
  });

  it("defaults to nothing disabled when no row is stored", async () => {
    expect(await disabledChannelsFor("t_1", "u_1", "invoices")).toEqual([]);
  });

  it("uses the owner's prefs for a tenant-wide notification", async () => {
    h.limit.mockResolvedValue([{ inApp: true, email: false }]);
    expect(await disabledChannelsFor("t_1", null, "appointments")).toEqual([
      "email",
    ]);
    expect(h.chain.innerJoin).toHaveBeenCalledTimes(1);
  });

  it("fails open: a lookup error delivers with the defaults", async () => {
    h.limit.mockRejectedValue(new Error("db down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await disabledChannelsFor("t_1", "u_1", "leads")).toEqual([]);
    spy.mockRestore();
  });
});
