import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const selectWhere = vi.fn();
  const selectFrom = vi.fn(() => ({ where: selectWhere }));
  const select = vi.fn(() => ({ from: selectFrom }));
  const onConflictDoUpdate = vi.fn();
  const insertValues = vi.fn(() => ({ onConflictDoUpdate }));
  const insert = vi.fn(() => ({ values: insertValues }));
  return { selectWhere, select, onConflictDoUpdate, insertValues, insert };
});

vi.mock("@/lib/db", () => ({ db: { select: h.select } }));

import {
  disabledChannels,
  getNotificationPrefs,
  setNotificationPref,
} from "@/lib/notifications/prefs";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getNotificationPrefs", () => {
  it("defaults every category to all channels on when no row is stored", async () => {
    h.selectWhere.mockResolvedValue([]);
    const prefs = await getNotificationPrefs("t_1", "u_1");
    expect(prefs.leads).toEqual({ email: true, in_app: true, push: true, sms: true });
    expect(prefs.billing.email).toBe(true);
  });

  it("overrides only the stored category, leaving the rest at defaults", async () => {
    h.selectWhere.mockResolvedValue([
      { category: "leads", email: false, inApp: true, push: false, sms: true },
    ]);
    const prefs = await getNotificationPrefs("t_1", "u_1");
    expect(prefs.leads).toEqual({ email: false, in_app: true, push: false, sms: true });
    expect(prefs.billing).toEqual({ email: true, in_app: true, push: true, sms: true });
  });
});

describe("disabledChannels", () => {
  it("lists the channels turned off for a category", () => {
    const prefs = {
      leads: { email: false, in_app: true, push: false, sms: true },
    } as any;
    expect(disabledChannels(prefs, "leads")).toEqual(["email", "push"]);
  });

  it("returns an empty list when everything is on", () => {
    const prefs = {
      leads: { email: true, in_app: true, push: true, sms: true },
    } as any;
    expect(disabledChannels(prefs, "leads")).toEqual([]);
  });
});

describe("setNotificationPref", () => {
  it("maps the in_app channel to the inApp column on upsert", async () => {
    await setNotificationPref(h as any, {
      tenantId: "t_1",
      userId: "u_1",
      category: "leads",
      channel: "in_app",
      enabled: false,
    });

    expect(h.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "t_1",
        userId: "u_1",
        category: "leads",
        inApp: false,
      })
    );
    expect(h.onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        set: expect.objectContaining({ inApp: false }),
      })
    );
  });

  it("upserts email/push/sms columns as-is", async () => {
    await setNotificationPref(h as any, {
      tenantId: "t_1",
      userId: "u_1",
      category: "billing",
      channel: "push",
      enabled: true,
    });

    expect(h.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ push: true })
    );
  });
});
