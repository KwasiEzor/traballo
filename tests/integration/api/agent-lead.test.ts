import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const setWhere = vi.fn().mockResolvedValue(undefined);
  const set = vi.fn(() => ({ where: setWhere }));
  const update = vi.fn(() => ({ set }));
  return {
    update,
    tenantsFindFirst: vi.fn(),
    conversationsFindFirst: vi.fn(),
    profilesFindFirst: vi.fn(),
    messagesFindMany: vi.fn(),
    sendEmail: vi.fn(),
    createNotification: vi.fn(),
    rateLimit: vi.fn(),
    tenantLeadCapReached: vi.fn(),
  };
});

vi.mock("@/lib/db", () => ({
  db: {
    update: h.update,
    query: {
      tenants: { findFirst: h.tenantsFindFirst },
      aiConversations: { findFirst: h.conversationsFindFirst },
      artisanProfiles: { findFirst: h.profilesFindFirst },
      aiMessages: { findMany: h.messagesFindMany },
    },
  },
}));
vi.mock("@/lib/email/send", () => ({ sendEmail: h.sendEmail }));
vi.mock("@/lib/notifications/create", () => ({
  createNotification: h.createNotification,
}));
vi.mock("@/lib/security/rate-limit", () => ({
  rateLimit: h.rateLimit,
  clientIp: () => "203.0.113.9",
}));
vi.mock("@/lib/security/lead-cap", () => ({
  tenantLeadCapReached: h.tenantLeadCapReached,
}));

import { POST } from "@/app/api/agent/lead/route";

const CONV_ID = "11111111-1111-4111-8111-111111111111";

function req(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/agent/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const goodBody = {
  slug: "plomberie-durand",
  conversationId: CONV_ID,
  name: "Claire Martin",
  contact: "claire@example.com",
  need: "Fuite sous l'évier",
};

beforeEach(() => {
  vi.clearAllMocks();
  h.rateLimit.mockReturnValue({ ok: true, retryAfterSec: 0 });
  h.tenantLeadCapReached.mockResolvedValue(false);
  h.tenantsFindFirst.mockResolvedValue({ id: "t_1" });
  h.conversationsFindFirst.mockResolvedValue({ id: CONV_ID, leadEmail: null });
  h.profilesFindFirst.mockResolvedValue({
    email: "artisan@example.com",
    businessName: "Plomberie Durand",
  });
  h.messagesFindMany.mockResolvedValue([]);
  h.sendEmail.mockResolvedValue({ id: "email_1" });
  h.createNotification.mockResolvedValue({ id: "n_1" });
});

describe("POST /api/agent/lead", () => {
  it("sends on a clean submission", async () => {
    const res = await POST(req(goodBody));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(h.sendEmail).toHaveBeenCalledOnce();
  });

  it("drops a honeypot hit without sending", async () => {
    const res = await POST(req({ ...goodBody, website: "http://spam" }));
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(h.sendEmail).not.toHaveBeenCalled();
    expect(h.rateLimit).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    h.rateLimit.mockReturnValue({ ok: false, retryAfterSec: 300 });
    const res = await POST(req(goodBody));
    expect(res.status).toBe(429);
    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("drops silently when the tenant daily cap is reached", async () => {
    h.tenantLeadCapReached.mockResolvedValue(true);
    const res = await POST(req(goodBody));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(h.sendEmail).not.toHaveBeenCalled();
    expect(h.createNotification).not.toHaveBeenCalled();
  });
});
