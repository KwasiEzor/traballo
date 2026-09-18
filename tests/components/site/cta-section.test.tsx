import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { CtaSection } from "@/components/site/sections";
import { heroImageFor, type PublicSite } from "@/lib/artisan/site-data";
import type { TemplateDef } from "@/lib/artisan/templates";

const style: TemplateDef["style"] = {
  hero: "photo",
  display: "bold",
  density: "regular",
  surface: "card",
  contrast: "high",
};

function site(overrides: Partial<PublicSite> = {}): PublicSite {
  return {
    slug: "greendan",
    businessName: "GreenDan",
    ownerName: "Dan",
    tradeType: "electricien",
    tradeLabel: "Électricité",
    email: "dan@example.com",
    phone: "0600000000",
    whatsappNumber: null,
    address: null,
    latitude: null,
    longitude: null,
    logoUrl: null,
    primaryColor: "#1f5fc4",
    templateId: "standard",
    metaTitle: null,
    metaDescription: null,
    isPublished: true,
    plan: "free",
    config: null,
    agent: null,
    ...overrides,
  };
}

describe("CtaSection", () => {
  it("uses the artisan's trade photo, not a fixed image tied to one métier", () => {
    const { container: electricien } = render(
      <CtaSection
        site={site({ tradeType: "electricien" })}
        content={{ title: "x", body: "y" }}
        style={style}
      />
    );
    const { container: jardinier } = render(
      <CtaSection
        site={site({ tradeType: "jardinier" })}
        content={{ title: "x", body: "y" }}
        style={style}
      />
    );

    expect(electricien.querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining(encodeURIComponent(heroImageFor("electricien")))
    );
    expect(jardinier.querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining(encodeURIComponent(heroImageFor("jardinier")))
    );
  });
});
