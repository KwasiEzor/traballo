import { describe, expect, it } from "vitest";
import { render } from "@react-email/render";
import { AuthLinkEmail } from "@/lib/email/templates/auth-link-email";
import { WelcomeEmail } from "@/lib/email/templates/welcome-email";
import { ContactEmail } from "@/lib/email/templates/contact-email";
import { LeadEmail } from "@/lib/email/templates/lead-email";
import { MarketingLeadEmail } from "@/lib/email/templates/marketing-lead-email";
import { UpgradeRequestEmail } from "@/lib/email/templates/upgrade-request-email";
import { InvoiceEmail } from "@/lib/email/templates/invoice-email";
import { PaymentFailedEmail } from "@/lib/email/templates/payment-failed-email";
import { EMAIL_BRAND } from "@/lib/email/brand";

// React SSR injects <!-- --> markers around interpolated text; strip them so
// content assertions read naturally.
function decode(s: string) {
  return s
    .replace(/<!--.*?-->/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");
}

async function rendered(el: React.ReactElement) {
  const raw = await render(el);
  return { raw, text: decode(raw) };
}

/** Every Traballo email carries the branded header + professional footer. */
function expectShell(raw: string, text: string) {
  expect(raw).toContain(EMAIL_BRAND.logoUrl); // header logo
  expect(text).toMatch(/Traballo/);
  expect(raw).toContain("https://www.traballo.pro"); // footer link
  expect(raw).toContain(`mailto:${EMAIL_BRAND.supportEmail}`);
  expect(text).toMatch(/Tous droits réservés/);
  expect(text).toMatch(new RegExp(`© ${new Date().getFullYear()} Traballo`));
  expect(raw).toMatch(/^<!DOCTYPE html/i);
  expect(text).not.toContain("undefined");
  expect(raw).not.toContain("[object Object]");
}

describe("email templates — branded shell + content", () => {
  it("AuthLinkEmail (verify / reset / magic link)", async () => {
    const { raw, text } = await rendered(
      AuthLinkEmail({
        heading: "Confirmez votre e-mail",
        intro: "Cliquez pour activer votre compte.",
        cta: "Confirmer",
        url: "https://app.traballo.pro/verify?token=abc123",
      })
    );
    expectShell(raw, text);
    expect(raw).toContain("https://app.traballo.pro/verify?token=abc123");
    expect(text).toContain("Confirmer");
    expect(text).toMatch(/ignorez/i);
  });

  it("WelcomeEmail", async () => {
    const { raw, text } = await rendered(WelcomeEmail({ firstName: "Marc" }));
    expectShell(raw, text);
    expect(text).toContain("Bonjour Marc");
    expect(raw).toContain(`${EMAIL_BRAND.app}/dashboard`);
    expect(text).toMatch(/Factur-X/);
  });

  it("WelcomeEmail without a first name", async () => {
    const { raw, text } = await rendered(WelcomeEmail({}));
    expectShell(raw, text);
    expect(text).toContain("Bonjour,");
  });

  it("ContactEmail", async () => {
    const { raw, text } = await rendered(
      ContactEmail({
        name: "Sophie Martin",
        email: "sophie@example.com",
        company: "SARL Martin",
        topic: "Migration depuis un autre outil",
        message: "Bonjour, je voudrais migrer mes 200 factures.",
      })
    );
    expectShell(raw, text);
    expect(text).toContain("Sophie Martin");
    expect(text).toContain("sophie@example.com");
    expect(text).toContain("SARL Martin");
    expect(text).toContain("migrer mes 200 factures");
  });

  it("ContactEmail without a company", async () => {
    const { raw, text } = await rendered(
      ContactEmail({
        name: "Jean",
        email: "jean@example.com",
        topic: "Découverte du produit",
        message: "Question rapide.",
      })
    );
    expectShell(raw, text);
    expect(text).not.toMatch(/Entreprise/);
  });

  it("LeadEmail (artisan site / AI agent)", async () => {
    const { raw, text } = await rendered(
      LeadEmail({
        businessName: "Plomberie Durand",
        name: "Claire",
        contact: "06 12 34 56 78",
        message: "Fuite sous l'évier, intervention rapide possible ?",
      })
    );
    expectShell(raw, text);
    expect(text).toContain("Plomberie Durand");
    expect(text).toContain("06 12 34 56 78");
    expect(text).toContain("Fuite sous l'évier");
  });

  it("MarketingLeadEmail", async () => {
    const { raw, text } = await rendered(
      MarketingLeadEmail({
        email: "prospect@example.com",
        name: "Luca",
        note: "Je gère 3 employés, le plan Business m'intéresse.",
        transcript: "Visiteur : Combien coûte Business ? Assistant : 49 €/mois.",
      })
    );
    expectShell(raw, text);
    expect(text).toContain("prospect@example.com");
    expect(text).toContain("plan Business m'intéresse");
    expect(text).toContain("49 €/mois");
  });

  it("MarketingLeadEmail with only an e-mail", async () => {
    const { raw, text } = await rendered(MarketingLeadEmail({ email: "x@y.com" }));
    expectShell(raw, text);
    expect(text).toContain("x@y.com");
  });

  it("UpgradeRequestEmail", async () => {
    const { raw, text } = await rendered(
      UpgradeRequestEmail({
        businessName: "Élec Moreau",
        ownerName: "Paul Moreau",
        email: "paul@moreau.test",
        phone: "01 02 03 04 05",
        slug: "elec-moreau",
        currentPlan: "free",
        targetPlan: "business",
      })
    );
    expectShell(raw, text);
    expect(text).toContain("Élec Moreau");
    expect(text).toContain("elec-moreau.traballo.pro");
    expect(text).toMatch(/Free/);
    expect(text).toMatch(/Business/);
  });

  it("InvoiceEmail (artisan → client, artisan sign-off)", async () => {
    const { raw, text } = await rendered(
      InvoiceEmail({
        invoiceNumber: "2026-0042",
        clientName: "Cabinet Léon",
        total: "1 240,00",
        dueDate: "2026-03-15",
        artisanBusinessName: "Menuiserie Bois & Cie",
        pdfUrl: "https://blob.example.com/invoice.pdf",
      })
    );
    expectShell(raw, text);
    expect(text).toContain("2026-0042");
    expect(text).toContain("Cabinet Léon");
    expect(text).toContain("1 240,00");
    expect(text).toContain("Menuiserie Bois & Cie");
    expect(raw).toContain("https://blob.example.com/invoice.pdf");
    expect(text).not.toMatch(/L['’]équipe Traballo/); // signed by the artisan
    expect(text).toMatch(/15 mars 2026/);
  });

  it("PaymentFailedEmail", async () => {
    const { raw, text } = await rendered(
      PaymentFailedEmail({
        businessName: "Plomberie Durand",
        amountDue: "29,00 €",
        portalHint: true,
      })
    );
    expectShell(raw, text);
    expect(text).toContain("Plomberie Durand");
    expect(text).toContain("29,00 €");
    expect(text).toMatch(/plan Free/);
    expect(raw).toContain(`${EMAIL_BRAND.app}/dashboard/settings?tab=abonnement`);
  });

  it("PaymentFailedEmail without a portal link", async () => {
    const { raw, text } = await rendered(
      PaymentFailedEmail({ businessName: "X" })
    );
    expectShell(raw, text);
    expect(text).not.toMatch(/Mettre à jour le paiement/);
  });

  it("InvoiceEmail without a PDF link", async () => {
    const { raw, text } = await rendered(
      InvoiceEmail({
        invoiceNumber: "2026-0001",
        clientName: "X",
        total: "100,00",
        dueDate: "2026-02-01",
        artisanBusinessName: "Y",
      })
    );
    expectShell(raw, text);
    expect(text).not.toMatch(/Télécharger la facture/);
  });
});
