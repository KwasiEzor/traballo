import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { verifyImpToken } from "@/lib/admin/impersonation";

const SECRET = "impersonation-test-secret";

function mint(payload: object): string {
  const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", SECRET).update(p).digest("base64url");
  return `${p}.${mac}`;
}

beforeEach(() => vi.stubEnv("BETTER_AUTH_SECRET", SECRET));
afterEach(() => vi.unstubAllEnvs());

describe("verifyImpToken", () => {
  it("accepts a well-formed, unexpired, correctly-signed token", () => {
    const token = mint({ tenantId: "t1", by: "admin@x", exp: Date.now() + 60_000 });
    expect(verifyImpToken(token)).toEqual({
      tenantId: "t1",
      by: "admin@x",
      exp: expect.any(Number),
    });
  });

  it("rejects a tampered payload", () => {
    const token = mint({ tenantId: "t1", by: "admin@x", exp: Date.now() + 60_000 });
    const [, mac] = token.split(".");
    const forged =
      Buffer.from(JSON.stringify({ tenantId: "EVIL", by: "x", exp: Date.now() + 60_000 })).toString(
        "base64url"
      ) + "." + mac;
    expect(verifyImpToken(forged)).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = mint({ tenantId: "t1", by: "admin@x", exp: Date.now() - 1 });
    expect(verifyImpToken(token)).toBeNull();
  });

  it("rejects a token signed with the wrong secret", () => {
    const p = Buffer.from(
      JSON.stringify({ tenantId: "t1", by: "admin@x", exp: Date.now() + 60_000 })
    ).toString("base64url");
    const wrongMac = createHmac("sha256", "other").update(p).digest("base64url");
    expect(verifyImpToken(`${p}.${wrongMac}`)).toBeNull();
  });

  it("rejects garbage / missing input", () => {
    expect(verifyImpToken(undefined)).toBeNull();
    expect(verifyImpToken("")).toBeNull();
    expect(verifyImpToken("nope")).toBeNull();
    expect(verifyImpToken("a.b.c")).toBeNull();
  });
});
