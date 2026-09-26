import { afterEach, describe, expect, it, vi } from "vitest";
import { EMAIL_BRAND, artisanBrand, artisanSender } from "@/lib/email/brand";

describe("artisanBrand", () => {
  it("uses the artisan's name, logo and colour", () => {
    expect(
      artisanBrand({
        businessName: "Plomberie Durand",
        logoUrl: "https://blob.example.com/logo.png",
        primaryColor: "#0f766e",
      })
    ).toEqual({
      name: "Plomberie Durand",
      logoUrl: "https://blob.example.com/logo.png",
      color: "#0f766e",
    });
  });

  it("falls back safely on a missing or unusable logo / colour", () => {
    expect(
      artisanBrand({
        businessName: "X",
        logoUrl: "javascript:alert(1)",
        primaryColor: "red; background:url(x)",
      })
    ).toEqual({ name: "X", logoUrl: null, color: EMAIL_BRAND.blue });
    expect(
      artisanBrand({ businessName: "X", logoUrl: null, primaryColor: null })
    ).toEqual({ name: "X", logoUrl: null, color: EMAIL_BRAND.blue });
  });
});

describe("artisanSender", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("shows the artisan's name on Traballo's sending address", () => {
    vi.stubEnv("EMAIL_FROM", "");
    expect(artisanSender("Plomberie Durand")).toBe(
      '"Plomberie Durand via Traballo" <noreply@traballo.pro>'
    );
    vi.stubEnv("EMAIL_FROM", "Traballo <factures@traballo.pro>");
    expect(artisanSender("Plomberie Durand")).toBe(
      '"Plomberie Durand via Traballo" <factures@traballo.pro>'
    );
  });

  it("cannot be used to inject headers or break the quoting", () => {
    vi.stubEnv("EMAIL_FROM", "");
    expect(artisanSender('Evil" <x@y.z>\r\nBcc: a@b.c')).toBe(
      '"Evil x@y.zBcc: a@b.c via Traballo" <noreply@traballo.pro>'
    );
  });
});
