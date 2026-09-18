import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const selectWhere = vi.fn();
  const selectFrom = vi.fn(() => ({ where: selectWhere }));
  const select = vi.fn(() => ({ from: selectFrom }));
  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  const del = vi.fn(() => ({ where: deleteWhere }));
  const sendNotification = vi.fn();
  const setVapidDetails = vi.fn();
  return { selectWhere, select, deleteWhere, del, sendNotification, setVapidDetails };
});

vi.mock("@/lib/db", () => ({ db: { select: h.select, delete: h.del } }));
vi.mock("web-push", () => ({
  default: { setVapidDetails: h.setVapidDetails, sendNotification: h.sendNotification },
}));

import { sendPush } from "@/lib/notifications/push";

const sub = {
  id: "sub_1",
  endpoint: "https://push.example.com/abc",
  p256dh: "p256dh_key",
  auth: "auth_key",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("VAPID_PUBLIC_KEY", "pub_key");
  vi.stubEnv("VAPID_PRIVATE_KEY", "priv_key");
  vi.stubEnv("VAPID_SUBJECT", "mailto:aide@traballo.pro");
  h.selectWhere.mockResolvedValue([sub]);
  h.sendNotification.mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllEnvs());

describe("sendPush", () => {
  it("does nothing when VAPID isn't configured", async () => {
    vi.stubEnv("VAPID_PUBLIC_KEY", "");
    await sendPush("u_1", { title: "Nouveau lead" });
    expect(h.select).not.toHaveBeenCalled();
  });

  it("sends the payload to every subscription of the user", async () => {
    await sendPush("u_1", { title: "Nouveau lead", body: "Claire", url: "/dashboard" });

    expect(h.sendNotification).toHaveBeenCalledWith(
      { endpoint: sub.endpoint, keys: { p256dh: "p256dh_key", auth: "auth_key" } },
      JSON.stringify({ title: "Nouveau lead", body: "Claire", url: "/dashboard" })
    );
  });

  it("purges a subscription the push service reports gone (410)", async () => {
    h.sendNotification.mockRejectedValue({ statusCode: 410 });
    await sendPush("u_1", { title: "x" });
    expect(h.del).toHaveBeenCalled();
    expect(h.deleteWhere).toHaveBeenCalled();
  });

  it("purges a subscription the push service reports not found (404)", async () => {
    h.sendNotification.mockRejectedValue({ statusCode: 404 });
    await sendPush("u_1", { title: "x" });
    expect(h.del).toHaveBeenCalled();
  });

  it("keeps a subscription alive on a transient error", async () => {
    h.sendNotification.mockRejectedValue({ statusCode: 500 });
    await sendPush("u_1", { title: "x" });
    expect(h.del).not.toHaveBeenCalled();
  });

  it("never throws, even when the DB lookup fails", async () => {
    h.selectWhere.mockRejectedValue(new Error("db down"));
    await expect(sendPush("u_1", { title: "x" })).resolves.toBeUndefined();
  });
});
