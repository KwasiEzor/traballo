import { afterEach, describe, expect, it, vi } from "vitest";
import { sitePhase, isBeta } from "@/lib/site-phase";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sitePhase", () => {
  it("defaults to beta when the env var is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_PHASE", "");
    expect(sitePhase()).toBe("beta");
    expect(isBeta()).toBe(true);
  });

  it("defaults to beta for an unrecognised value", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_PHASE", "preview");
    expect(sitePhase()).toBe("beta");
  });

  it("returns ga only for the exact value 'ga'", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_PHASE", "ga");
    expect(sitePhase()).toBe("ga");
    expect(isBeta()).toBe(false);
  });
});
