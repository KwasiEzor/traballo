import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { encryptSecret, decryptSecret, maskSecret } from "@/lib/crypto";

beforeEach(() => {
  vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-value-for-encryption-tests");
});
afterEach(() => vi.unstubAllEnvs());

describe("encryptSecret / decryptSecret", () => {
  it("round-trips a value", () => {
    const secret = "sk-ant-api03-abcdefghijklmnop";
    const enc = encryptSecret(secret);
    expect(enc).not.toContain(secret);
    expect(decryptSecret(enc)).toBe(secret);
  });

  it("produces a different ciphertext each time (random salt + iv)", () => {
    expect(encryptSecret("same")).not.toBe(encryptSecret("same"));
  });

  it("fails to decrypt if the payload is tampered with", () => {
    const enc = encryptSecret("secret");
    const buf = Buffer.from(enc, "base64");
    buf[buf.length - 1] ^= 0xff;
    expect(() => decryptSecret(buf.toString("base64"))).toThrow();
  });

  it("throws without BETTER_AUTH_SECRET", () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    expect(() => encryptSecret("x")).toThrow(/BETTER_AUTH_SECRET/);
  });
});

describe("maskSecret", () => {
  it("shows only the last 4 characters", () => {
    expect(maskSecret("sk-ant-api03-XXXXwxyz")).toBe("••••••••wxyz");
  });
});
