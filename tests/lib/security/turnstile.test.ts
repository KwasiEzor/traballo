import { afterEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { verifyTurnstile, turnstileSiteKey } from "@/lib/security/turnstile";

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("verifyTurnstile", () => {
  it("skips verification when no secret is configured", async () => {
    vi.stubEnv("TURNSTILE_SITE_SECRET", "");
    const res = await verifyTurnstile("any-token");
    expect(res).toEqual({ success: true, reason: "disabled" });
  });

  it("reports a missing token without calling Cloudflare", async () => {
    vi.stubEnv("TURNSTILE_SITE_SECRET", "1x0000000000000000000000000000000AA");
    const res = await verifyTurnstile("");
    expect(res).toEqual({ success: false, reason: "missing" });
  });

  it("returns success when Cloudflare validates the token", async () => {
    vi.stubEnv("TURNSTILE_SITE_SECRET", "1x0000000000000000000000000000000AA");
    server.use(
      http.post(SITEVERIFY, async ({ request }) => {
        const body = await request.formData();
        expect(body.get("secret")).toBe("1x0000000000000000000000000000000AA");
        expect(body.get("response")).toBe("good-token");
        return HttpResponse.json({ success: true, "challenge_ts": "2026-01-01T00:00:00Z" });
      })
    );
    const res = await verifyTurnstile("good-token", { remoteIp: "203.0.113.5" });
    expect(res).toEqual({ success: true, reason: "ok" });
  });

  it("rejects when the token's action does not match", async () => {
    vi.stubEnv("TURNSTILE_SITE_SECRET", "secret");
    server.use(
      http.post(SITEVERIFY, () =>
        HttpResponse.json({ success: true, action: "login" })
      )
    );
    const res = await verifyTurnstile("t", { expectedAction: "contact" });
    expect(res).toEqual({ success: false, reason: "rejected" });
  });

  it("rejects when the token's hostname is not in TURNSTILE_HOSTNAMES", async () => {
    vi.stubEnv("TURNSTILE_SITE_SECRET", "secret");
    vi.stubEnv("TURNSTILE_HOSTNAMES", "traballo.pro");
    server.use(
      http.post(SITEVERIFY, () =>
        HttpResponse.json({ success: true, hostname: "evil.example.com" })
      )
    );
    const res = await verifyTurnstile("t");
    expect(res).toEqual({ success: false, reason: "rejected" });
  });

  it("accepts a subdomain of an allowed hostname", async () => {
    vi.stubEnv("TURNSTILE_SITE_SECRET", "secret");
    vi.stubEnv("TURNSTILE_HOSTNAMES", "traballo.pro");
    server.use(
      http.post(SITEVERIFY, () =>
        HttpResponse.json({ success: true, hostname: "www.traballo.pro" })
      )
    );
    const res = await verifyTurnstile("t");
    expect(res).toEqual({ success: true, reason: "ok" });
  });

  it("reports 'rejected' when Cloudflare rejects the token", async () => {
    vi.stubEnv("TURNSTILE_SITE_SECRET", "secret");
    server.use(
      http.post(SITEVERIFY, () =>
        HttpResponse.json({ success: false, "error-codes": ["invalid-input-response"] })
      )
    );
    const res = await verifyTurnstile("bad-token");
    expect(res).toEqual({ success: false, reason: "rejected" });
  });

  it("reports 'unreachable' (not 'rejected') when the Cloudflare request errors", async () => {
    vi.stubEnv("TURNSTILE_SITE_SECRET", "secret");
    server.use(http.post(SITEVERIFY, () => HttpResponse.error()));
    const res = await verifyTurnstile("token");
    expect(res).toEqual({ success: false, reason: "unreachable" });
  });
});

describe("turnstileSiteKey", () => {
  it("returns the configured public site key", () => {
    vi.stubEnv("TURNSTILE_SITE_KEY", "0x4AAAAAAA_test");
    expect(turnstileSiteKey()).toBe("0x4AAAAAAA_test");
  });

  it("returns an empty string when unset", () => {
    vi.stubEnv("TURNSTILE_SITE_KEY", "");
    expect(turnstileSiteKey()).toBe("");
  });

  it("falls back to Cloudflare's dummy key in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("TURNSTILE_SITE_KEY", "0xREALKEY");
    expect(turnstileSiteKey()).toBe("1x00000000000000000000AA");
  });

  it("uses the real key in development when TURNSTILE_FORCE_REAL=1", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("TURNSTILE_FORCE_REAL", "1");
    vi.stubEnv("TURNSTILE_SITE_KEY", "0xREALKEY");
    expect(turnstileSiteKey()).toBe("0xREALKEY");
  });
});
