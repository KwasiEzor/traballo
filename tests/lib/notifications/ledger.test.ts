import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const returning = vi.fn();
  const onConflictDoNothing = vi.fn(() => ({ returning }));
  const values = vi.fn(() => ({ onConflictDoNothing }));
  const deleteWhere = vi.fn();
  const selectWhere = vi.fn();
  return {
    returning,
    values,
    deleteWhere,
    selectWhere,
    db: {
      insert: vi.fn(() => ({ values })),
      delete: vi.fn(() => ({ where: deleteWhere })),
      select: vi.fn(() => ({ from: vi.fn(() => ({ where: selectWhere })) })),
    },
  };
});

vi.mock("@/lib/db", () => ({ db: h.db }));

import { claimDelivery, deliveredKinds, releaseDelivery } from "@/lib/notifications/ledger";

const key = {
  tenantId: "t_1",
  entityType: "appointment",
  entityId: "appt_1",
  kind: "confirmation",
  channel: "email",
};

beforeEach(() => {
  vi.clearAllMocks();
  h.returning.mockResolvedValue([{ id: "d_1" }]);
  h.selectWhere.mockResolvedValue([]);
});

describe("notification ledger", () => {
  it("claims a delivery once", async () => {
    expect(await claimDelivery(key)).toBe(true);
    expect(h.values).toHaveBeenCalledWith(key);
    h.returning.mockResolvedValue([]);
    expect(await claimDelivery(key)).toBe(false);
  });

  it("releases a claim", async () => {
    await releaseDelivery(key);
    expect(h.db.delete).toHaveBeenCalledTimes(1);
    expect(h.deleteWhere).toHaveBeenCalledTimes(1);
  });

  it("lists the kinds already delivered, per entity", async () => {
    h.selectWhere.mockResolvedValue([
      { entityId: "inv_1", kind: "reminder_j7" },
      { entityId: "inv_1", kind: "reminder_j30" },
      { entityId: "inv_2", kind: "reminder_j7" },
    ]);
    const map = await deliveredKinds("invoice", ["inv_1", "inv_2"], "email");
    expect(map.get("inv_1")).toEqual(new Set(["reminder_j7", "reminder_j30"]));
    expect(map.get("inv_2")).toEqual(new Set(["reminder_j7"]));
    expect(await deliveredKinds("invoice", [], "email")).toEqual(new Map());
  });
});
