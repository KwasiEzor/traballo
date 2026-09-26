import { describe, expect, it } from "vitest";
import {
  addDays,
  parisDate,
  parisDayBounds,
  parisTime,
  parisWallTime,
} from "@/lib/time";
import { formatDate } from "@/lib/utils";

describe("parisWallTime", () => {
  it("reads a date + time as Paris wall-clock time", () => {
    // Summer: UTC+2.
    expect(parisWallTime("2026-07-01", "09:00").toISOString()).toBe(
      "2026-07-01T07:00:00.000Z"
    );
    // Winter: UTC+1.
    expect(parisWallTime("2026-12-01", "09:00").toISOString()).toBe(
      "2026-12-01T08:00:00.000Z"
    );
  });

  it("survives the DST switches", () => {
    // 02:30 does not exist on 2026-03-29 in Paris: lands just after the gap.
    expect(parisWallTime("2026-03-29", "02:30").toISOString()).toBe(
      "2026-03-29T01:30:00.000Z"
    );
    // 02:30 happens twice on 2026-10-25: round-trips to 02:30.
    expect(parisTime(parisWallTime("2026-10-25", "02:30"))).toBe("02:30");
  });
});

describe("parisDate / parisTime", () => {
  it("shows an instant on the Paris calendar and clock", () => {
    expect(parisDate(new Date("2026-09-30T23:30:00Z"))).toBe("2026-10-01");
    expect(parisTime(new Date("2026-07-01T07:00:00Z"))).toBe("09:00");
    expect(parisTime(new Date("2026-12-01T17:05:00Z"))).toBe("18:05");
  });
});

describe("parisDayBounds / addDays", () => {
  it("gives the UTC instants of a Paris day", () => {
    expect(parisDayBounds("2026-10-01")).toEqual({
      start: new Date("2026-09-30T22:00:00.000Z"),
      end: new Date("2026-10-01T22:00:00.000Z"),
    });
    // The autumn switch day lasts 25 hours.
    const { start, end } = parisDayBounds("2026-10-25");
    expect((end.getTime() - start.getTime()) / 3_600_000).toBe(25);
  });

  it("adds calendar days", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("formatDate", () => {
  it("shows instants in Paris time, whatever the server timezone", () => {
    expect(formatDate(new Date("2026-09-30T23:30:00Z"))).toBe("1 octobre 2026");
    expect(
      formatDate(new Date("2026-07-01T07:00:00Z"), { hour: "2-digit", minute: "2-digit" })
    ).toBe("09:00");
  });

  it("shows a plain date column as is", () => {
    expect(formatDate("2026-09-01")).toBe("1 septembre 2026");
  });
});
