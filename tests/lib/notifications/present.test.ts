import { describe, expect, it } from "vitest";
import {
  badgeLabel,
  paginate,
  safeActionUrl,
  timeAgo,
} from "@/lib/notifications/present";

describe("safeActionUrl", () => {
  it("keeps internal dashboard paths", () => {
    expect(safeActionUrl("/dashboard/settings")).toBe("/dashboard/settings");
    expect(safeActionUrl("/dashboard/invoices/abc?tab=pay#x")).toBe(
      "/dashboard/invoices/abc?tab=pay#x"
    );
  });

  it("rejects anything that could leave the app", () => {
    for (const url of [
      "https://evil.example",
      "//evil.example/path",
      "/\\evil.example",
      "javascript:alert(1)",
      "dashboard/settings",
      "",
      null,
      undefined,
    ]) {
      expect(safeActionUrl(url)).toBeNull();
    }
  });
});

describe("badgeLabel", () => {
  it("hides the badge at zero", () => {
    expect(badgeLabel(0)).toBeNull();
    expect(badgeLabel(-1)).toBeNull();
  });

  it("shows the count up to 9, then 9+", () => {
    expect(badgeLabel(1)).toBe("1");
    expect(badgeLabel(9)).toBe("9");
    expect(badgeLabel(10)).toBe("9+");
    expect(badgeLabel(250)).toBe("9+");
  });
});

describe("paginate", () => {
  it("computes page count and offset", () => {
    expect(paginate(45, 2, 20)).toEqual({ page: 2, pageCount: 3, offset: 20 });
  });

  it("clamps out-of-range and garbage pages", () => {
    expect(paginate(45, 99, 20)).toEqual({ page: 3, pageCount: 3, offset: 40 });
    expect(paginate(45, 0, 20)).toEqual({ page: 1, pageCount: 3, offset: 0 });
    expect(paginate(45, Number.NaN, 20)).toEqual({ page: 1, pageCount: 3, offset: 0 });
  });

  it("always has at least one page", () => {
    expect(paginate(0, 1, 20)).toEqual({ page: 1, pageCount: 1, offset: 0 });
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-09-26T12:00:00Z");

  it("uses short French relative labels", () => {
    expect(timeAgo(new Date("2026-09-26T11:59:40Z"), now)).toBe("à l'instant");
    expect(timeAgo(new Date("2026-09-26T11:55:00Z"), now)).toBe("il y a 5 min");
    expect(timeAgo(new Date("2026-09-26T09:00:00Z"), now)).toBe("il y a 3 h");
    expect(timeAgo(new Date("2026-09-24T12:00:00Z"), now)).toBe("il y a 2 j");
  });

  it("falls back to a date after a week", () => {
    expect(timeAgo(new Date("2026-09-10T12:00:00Z"), now)).toMatch(/10 sept/);
  });
});
