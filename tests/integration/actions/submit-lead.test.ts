import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  tenantsFindFirst: vi.fn(),
  profileFindFirst: vi.fn(),
  sendEmail: vi.fn(),
  createNotification: vi.fn(),
  verifyTurnstile: vi.fn(),
  rateLimit: vi.fn(),
  tenantLeadCapReached: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      tenants: { findFirst: h.tenantsFindFirst },
      artisanProfiles: { findFirst: h.profileFindFirst },
    },
  },
}));
vi.mock("@/lib/email/send", () => ({ sendEmail: h.sendEmail }));
vi.mock("@/lib/notifications/create", () => ({
  createNotification: h.createNotification,
}));
vi.mock("@/lib/security/turnstile", () => ({
  verifyTurnstile: h.verifyTurnstile,
}));
vi.mock("@/lib/security/rate-limit", () => ({
  rateLimit: h.rateLimit,
  clientIp: () => "203.0.113.5",
}));
vi.mock("@/lib/security/lead-cap", () => ({
  tenantLeadCapReached: h.tenantLeadCapReached,
}));

import { submitLead } from "@/app/sites/[slug]/actions";

function fd(overrides: Record<string, string> = {}): FormData {
  const f = new FormData();
  f.set("slug", "plomberie-durand");
  f.set("name", "Claire Martin");
  f.set("contact", "claire@example.com");
  f.set("message", "Fuite sous l'évier de la cuisine.");
  f.set("cf-turnstile-response", "tok");
  for (const [k, v] of Object.entries(overrides)) f.set(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
  h.rateLimit.mockReturnValue({ ok: true, retryAfterSec: 0 });
  h.verifyTurnstile.mockResolvedValue({ success: true, reason: "ok" });
  h.tenantLeadCapReached.mockResolvedValue(false);
  h.tenantsFindFirst.mockResolvedValue({ id: "t_1" });
  h.profileFindFirst.mockResolvedValue({
    email: "artisan@example.com",
    businessName: "Plomberie Durand",
  });
  h.sendEmail.mockResolvedValue({ id: "email_1" });
  h.createNotification.mockResolvedValue({ id: "n_1" });
});

describe("submitLead", () => {
  it("sends the email and notification on a clean submission", async () => {
    const res = await submitLead({}, fd());
    expect(res).toEqual({ ok: true });
    expect(h.sendEmail).toHaveBeenCalledOnce();
    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "t_1", type: "leads.site_enquiry" })
    );
  });

  it("drops a honeypot hit silently without sending", async () => {
    const res = await submitLead({}, fd({ website: "http://spam.example" }));
    expect(res).toEqual({ ok: true });
    expect(h.verifyTurnstile).not.toHaveBeenCalled();
    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("blocks when the rate limit is exceeded", async () => {
    h.rateLimit.mockReturnValue({ ok: false, retryAfterSec: 120 });
    const res = await submitLead({}, fd());
    expect(res.error).toMatch(/Trop de demandes/);
    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("blocks a missing Turnstile token", async () => {
    h.verifyTurnstile.mockResolvedValue({ success: false, reason: "missing" });
    const res = await submitLead({}, fd({ "cf-turnstile-response": "" }));
    expect(res.error).toMatch(/anti-spam/);
    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("blocks a rejected Turnstile token", async () => {
    h.verifyTurnstile.mockResolvedValue({ success: false, reason: "rejected" });
    const res = await submitLead({}, fd());
    expect(res.error).toMatch(/anti-spam/);
  });

  it("still sends when Cloudflare is unreachable", async () => {
    h.verifyTurnstile.mockResolvedValue({
      success: false,
      reason: "unreachable",
    });
    const res = await submitLead({}, fd());
    expect(res).toEqual({ ok: true });
    expect(h.sendEmail).toHaveBeenCalledOnce();
  });

  it("verifies the token with allowAnyHostname and the site-lead action", async () => {
    await submitLead({}, fd());
    expect(h.verifyTurnstile).toHaveBeenCalledWith(
      "tok",
      expect.objectContaining({
        expectedAction: "site-lead",
        allowAnyHostname: true,
      })
    );
  });

  it("drops silently once the tenant daily cap is reached", async () => {
    h.tenantLeadCapReached.mockResolvedValue(true);
    const res = await submitLead({}, fd());
    expect(res).toEqual({ ok: true });
    expect(h.sendEmail).not.toHaveBeenCalled();
    expect(h.createNotification).not.toHaveBeenCalled();
  });

  it("reports an unknown site", async () => {
    h.tenantsFindFirst.mockResolvedValue(undefined);
    const res = await submitLead({}, fd());
    expect(res).toEqual({ error: "Site introuvable." });
  });
});
