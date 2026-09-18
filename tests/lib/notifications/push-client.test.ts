import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pushSupported, subscribeToPush } from "@/lib/notifications/push-client";

const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
const originalPushManager = (window as any).PushManager;
const originalNotification = (globalThis as any).Notification;

function stubSupport() {
  Object.defineProperty(window, "PushManager", { value: class {}, configurable: true });
}

function restoreSupport() {
  if (originalPushManager === undefined) delete (window as any).PushManager;
  else (window as any).PushManager = originalPushManager;
  if (originalServiceWorker) {
    Object.defineProperty(navigator, "serviceWorker", originalServiceWorker);
  } else {
    delete (navigator as any).serviceWorker;
  }
  if (originalNotification === undefined) delete (globalThis as any).Notification;
  else (globalThis as any).Notification = originalNotification;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  restoreSupport();
});

describe("pushSupported", () => {
  it("is false without serviceWorker + PushManager", () => {
    restoreSupport();
    expect(pushSupported()).toBe(false);
  });

  it("is true once both APIs exist", () => {
    stubSupport();
    Object.defineProperty(navigator, "serviceWorker", { value: {}, configurable: true });
    expect(pushSupported()).toBe(true);
  });
});

describe("subscribeToPush", () => {
  it("throws on an unsupported browser", async () => {
    restoreSupport();
    await expect(subscribeToPush("key")).rejects.toThrow(/pas prises en charge/);
  });

  it("throws when no VAPID key is configured", async () => {
    stubSupport();
    Object.defineProperty(navigator, "serviceWorker", { value: {}, configurable: true });
    await expect(subscribeToPush("")).rejects.toThrow(/non configurées/);
  });

  it("throws when the user denies permission", async () => {
    stubSupport();
    (globalThis as any).Notification = { requestPermission: vi.fn().mockResolvedValue("denied") };
    Object.defineProperty(navigator, "serviceWorker", { value: {}, configurable: true });

    await expect(subscribeToPush("key")).rejects.toThrow(/refusée/);
  });

  it("reuses an existing subscription without re-subscribing", async () => {
    stubSupport();
    (globalThis as any).Notification = { requestPermission: vi.fn().mockResolvedValue("granted") };
    const toJSON = () => ({
      endpoint: "https://push.example.com/abc",
      keys: { p256dh: "p256dh_val", auth: "auth_val" },
    });
    const subscribe = vi.fn();
    const getSubscription = vi.fn().mockResolvedValue({ toJSON });
    const register = vi.fn().mockResolvedValue({
      pushManager: { getSubscription, subscribe },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register, ready: Promise.resolve() },
      configurable: true,
    });

    const result = await subscribeToPush("dGVzdA");

    expect(result).toEqual({
      endpoint: "https://push.example.com/abc",
      keys: { p256dh: "p256dh_val", auth: "auth_val" },
    });
    expect(subscribe).not.toHaveBeenCalled();
  });

  it("subscribes fresh when there is no existing subscription", async () => {
    stubSupport();
    (globalThis as any).Notification = { requestPermission: vi.fn().mockResolvedValue("granted") };
    const toJSON = () => ({
      endpoint: "https://push.example.com/xyz",
      keys: { p256dh: "p256dh_val", auth: "auth_val" },
    });
    const getSubscription = vi.fn().mockResolvedValue(null);
    const subscribe = vi.fn().mockResolvedValue({ toJSON });
    const register = vi.fn().mockResolvedValue({
      pushManager: { getSubscription, subscribe },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register, ready: Promise.resolve() },
      configurable: true,
    });

    const result = await subscribeToPush("dGVzdA");

    expect(subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true })
    );
    expect(result.endpoint).toBe("https://push.example.com/xyz");
  });
});
