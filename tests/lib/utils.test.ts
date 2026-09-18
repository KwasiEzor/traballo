import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "@/lib/utils";

describe("formatRelativeTime", () => {
  const now = new Date("2026-04-20T12:00:00Z");

  it("formats a few minutes ago", () => {
    expect(formatRelativeTime(new Date("2026-04-20T11:55:00Z"), now)).toBe(
      "il y a 5 minutes"
    );
  });

  it("formats a few hours ago", () => {
    expect(formatRelativeTime(new Date("2026-04-20T09:00:00Z"), now)).toBe(
      "il y a 3 heures"
    );
  });

  it("formats a day ago", () => {
    expect(formatRelativeTime(new Date("2026-04-19T12:00:00Z"), now)).toBe(
      "hier"
    );
  });

  it("falls back to seconds for very recent timestamps", () => {
    expect(formatRelativeTime(new Date("2026-04-20T11:59:50Z"), now)).toBe(
      "il y a 10 secondes"
    );
  });
});
