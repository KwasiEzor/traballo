import { describe, expect, it } from "vitest";
import { resolveSiteConfig } from "@/lib/artisan/site-config";
import { isBusinessPlan, isPremiumPlan } from "@/lib/artisan/templates";
import type { PublicSite } from "@/lib/artisan/site-data";

function site(plan: PublicSite["plan"]): PublicSite {
  return {
    slug: "x",
    businessName: "X",
    ownerName: "Y",
    tradeType: "plombier",
    tradeLabel: "Plomberie",
    email: "y@x.test",
    phone: "01",
    whatsappNumber: "01",
    address: "Lyon",
    logoUrl: null,
    primaryColor: "#000",
    templateId: "standard",
    metaTitle: null,
    metaDescription: null,
    isPublished: true,
    plan,
    config: null,
    agent: null,
  };
}

describe("plan helpers", () => {
  it("isBusinessPlan is true only for business", () => {
    expect(isBusinessPlan("business")).toBe(true);
    expect(isBusinessPlan("pro")).toBe(false);
    expect(isBusinessPlan("free")).toBe(false);
  });
  it("isPremiumPlan stays pro OR business", () => {
    expect(isPremiumPlan("pro")).toBe(true);
    expect(isPremiumPlan("business")).toBe(true);
    expect(isPremiumPlan("free")).toBe(false);
  });
});

describe("resolveSiteConfig chrome — floating buttons", () => {
  it("defaults both floating buttons on", () => {
    const c = resolveSiteConfig(site("free"), "Lyon", "free", null);
    expect(c.chrome.showCallButton).toBe(true);
    expect(c.chrome.showWhatsappButton).toBe(true);
  });

  it("honours explicit off switches", () => {
    const stored = { chrome: { showCallButton: false, showWhatsappButton: false } };
    const c = resolveSiteConfig(site("business"), "Lyon", "business", stored);
    expect(c.chrome.showCallButton).toBe(false);
    expect(c.chrome.showWhatsappButton).toBe(false);
  });
});
