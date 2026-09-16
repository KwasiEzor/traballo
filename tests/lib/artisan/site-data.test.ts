import { describe, expect, it } from "vitest";
import { servicesFor, heroImageFor } from "@/lib/artisan/site-data";
import { TRADES } from "@/lib/artisan/trades";

const DEFAULT_TITLES = ["Devis gratuit", "Intervention soignée", "Suivi"];

describe("servicesFor", () => {
  it("returns a dedicated, non-generic service list for every trade except 'autre'", () => {
    for (const { value } of TRADES) {
      if (value === "autre") continue;
      const items = servicesFor(value);
      expect(items.length).toBeGreaterThan(0);
      const titles = items.map((i) => i.title);
      expect(titles).not.toEqual(DEFAULT_TITLES);
      for (const item of items) {
        expect(item.title.trim().length).toBeGreaterThan(0);
        expect(item.text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("falls back to the generic services for 'autre' and unknown/null trades", () => {
    expect(servicesFor("autre").map((i) => i.title)).toEqual(DEFAULT_TITLES);
    expect(servicesFor(null).map((i) => i.title)).toEqual(DEFAULT_TITLES);
    expect(servicesFor("not-a-real-trade").map((i) => i.title)).toEqual(DEFAULT_TITLES);
  });
});

describe("heroImageFor", () => {
  it("resolves a dedicated photo for every known trade", () => {
    for (const { value } of TRADES) {
      if (value === "autre") continue;
      expect(heroImageFor(value)).toBe(`/templates/trades/${value}.webp`);
    }
  });

  it("falls back to the generic photo for 'autre' and unknown/null trades", () => {
    expect(heroImageFor("autre")).toBe("/templates/trades/autre.webp");
    expect(heroImageFor(null)).toBe("/templates/trades/autre.webp");
    expect(heroImageFor("not-a-real-trade")).toBe("/templates/trades/autre.webp");
  });
});
