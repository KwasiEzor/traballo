import { beforeEach, describe, expect, it, vi } from "vitest";
import * as React from "react";

const h = vi.hoisted(() => {
  const limit = vi.fn();
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  return { limit, select: vi.fn(() => ({ from })), sendEmail: vi.fn() };
});

vi.mock("@/lib/db", () => ({ db: { select: h.select } }));
vi.mock("@/lib/email/send", () => ({ sendEmail: h.sendEmail }));

import { sendArtisanEmail } from "@/lib/notifications/email";

const mail = { subject: "Sujet", react: React.createElement("p", null, "x") };

beforeEach(() => {
  vi.clearAllMocks();
  h.limit.mockResolvedValue([{ email: "artisan@example.com" }]);
  h.sendEmail.mockResolvedValue({ id: "e_1" });
});

describe("sendArtisanEmail", () => {
  it("sends to the tenant's business address", async () => {
    expect(await sendArtisanEmail("t_1", mail)).toBe(true);
    expect(h.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "artisan@example.com", subject: "Sujet" })
    );
  });

  it("returns false without a profile e-mail", async () => {
    h.limit.mockResolvedValue([]);
    expect(await sendArtisanEmail("t_1", mail)).toBe(false);
    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("never throws, reports failure", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    h.sendEmail.mockResolvedValue({ error: "domain not verified" });
    expect(await sendArtisanEmail("t_1", mail)).toBe(false);
    h.sendEmail.mockRejectedValue(new Error("down"));
    expect(await sendArtisanEmail("t_1", mail)).toBe(false);
    spy.mockRestore();
  });
});
