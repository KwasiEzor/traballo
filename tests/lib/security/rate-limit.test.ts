import { afterEach, describe, expect, it, vi } from "vitest";
import {
  rateLimit,
  clientIp,
  __resetRateLimits,
} from "@/lib/security/rate-limit";

afterEach(() => {
  __resetRateLimits();
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("allows hits up to the limit, then blocks", () => {
    const key = "ip:1.1.1.1";
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    }
    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("keeps separate windows per key", () => {
    expect(rateLimit("a", 1, 60_000).ok).toBe(true);
    expect(rateLimit("a", 1, 60_000).ok).toBe(false);
    expect(rateLimit("b", 1, 60_000).ok).toBe(true);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    expect(rateLimit("k", 1, 1_000).ok).toBe(true);
    expect(rateLimit("k", 1, 1_000).ok).toBe(false);
    vi.advanceTimersByTime(1_001);
    expect(rateLimit("k", 1, 1_000).ok).toBe(true);
  });
});

describe("clientIp", () => {
  it("takes the first entry of x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.5, 70.41.3.18" });
    expect(clientIp(h)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe(
      "198.51.100.2"
    );
  });

  it("returns 'unknown' when no IP header is present", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
