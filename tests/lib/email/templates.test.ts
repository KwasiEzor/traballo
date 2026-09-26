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
import { SubscriptionStartedEmail } from "@/lib/email/templates/subscription-started-email";
import { SubscriptionChangedEmail } from "@/lib/email/templates/subscription-changed-email";
import { SubscriptionCanceledEmail } from "@/lib/email/templates/subscription-canceled-email";
import { InvoiceReminderEmail } from "@/lib/email/templates/invoice-reminder-email";
import { NotificationEmail } from "@/lib/email/templates/notification-email";
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
    expect(raw).not.toContain("/mascot/removed/"); // no mascot by default
  });

  it("AuthLinkEmail with an explicit mascotPose (e.g. email verification)", async () => {
    const { raw } = await rendered(
      AuthLinkEmail({
        heading: "Confirmez votre e-mail",
        intro: "Bienvenue sur Traballo.",
        cta: "Confirmer",
        url: "https://app.traballo.pro/verify?token=abc123",
        mascotPose: "welcome",
      })
    );
    expect(raw).toContain("/mascot/removed/trabby-3D-onboarding-rmv.png");
  });

  it("WelcomeEmail", async () => {
    const { raw, text } = await rendered(WelcomeEmail({ firstName: "Marc" }));
    expectShell(raw, text);
    expect(text).toContain("Bonjour Marc");
    expect(raw).toContain(`${EMAIL_BRAND.app}/dashboard`);
    expect(text).toMatch(/Factur-X/);
    expect(raw).toContain("/mascot/removed/trabby-3D-onboarding-rmv.png");
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
    expect(raw).not.toContain("/mascot/removed/"); // artisan → their client, no Trabby
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
    expect(raw).toContain("/mascot/removed/trabby-3D-error-rmv.png");
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

  it("SubscriptionStartedEmail", async () => {
    const { raw, text } = await rendered(
      SubscriptionStartedEmail({ businessName: "Plomberie Durand", plan: "pro" })
    );
    expectShell(raw, text);
    expect(text).toContain("Plomberie Durand");
    expect(text).toMatch(/plan Pro/);
    expect(text).toContain("Factures illimitées"); // what the plan unlocks
    expect(text).not.toMatch(/Tout le plan Free, plus :/);
    expect(raw).toContain(`${EMAIL_BRAND.app}/dashboard`);
    expect(raw).toContain("/mascot/removed/trabby-3D-onboarding-rmv.png");
  });

  it("SubscriptionChangedEmail — upgrade", async () => {
    const { raw, text } = await rendered(
      SubscriptionChangedEmail({
        businessName: "Plomberie Durand",
        from: "pro",
        to: "business",
      })
    );
    expectShell(raw, text);
    expect(text).toMatch(/plan Business/);
    expect(text).toMatch(/Pro/);
    expect(text).not.toMatch(/ne sont plus disponibles/);
    expect(raw).toContain(`${EMAIL_BRAND.app}/dashboard/settings?tab=abonnement`);
  });

  it("SubscriptionChangedEmail — downgrade", async () => {
    const { raw, text } = await rendered(
      SubscriptionChangedEmail({ businessName: "X", from: "business", to: "pro" })
    );
    expectShell(raw, text);
    expect(text).toMatch(/plan Pro/);
    expect(text).toMatch(/ne sont plus disponibles/);
  });

  it("SubscriptionCanceledEmail — requested", async () => {
    const { raw, text } = await rendered(
      SubscriptionCanceledEmail({
        businessName: "Plomberie Durand",
        from: "pro",
        cause: "requested",
      })
    );
    expectShell(raw, text);
    expect(text).toContain("Plomberie Durand");
    expect(text).toMatch(/plan Free/);
    expect(text).toMatch(/restent accessibles/);
    expect(text).not.toMatch(/paiement/i);
    expect(raw).toContain(`${EMAIL_BRAND.app}/dashboard/settings?tab=abonnement`);
    expect(raw).not.toContain("/mascot/removed/");
  });

  it("SubscriptionCanceledEmail — unpaid", async () => {
    const { raw, text } = await rendered(
      SubscriptionCanceledEmail({ businessName: "X", from: "business", cause: "payment" })
    );
    expectShell(raw, text);
    expect(text).toMatch(/paiement/i);
    expect(text).toMatch(/plan Free/);
    expect(raw).toContain("/mascot/removed/trabby-3D-error-rmv.png");
  });

  it("NotificationEmail (artisan notice through their preferences)", async () => {
    const { raw, text } = await rendered(
      NotificationEmail({
        heading: "Facture F-2026-0042 en retard",
        body: "Claire Martin — 1 234,50 € TTC, échéance le 1 septembre 2026.",
        actionUrl: "/dashboard/invoices/abc",
        cta: "Voir la facture",
      })
    );
    expectShell(raw, text);
    expect(text).toContain("Facture F-2026-0042 en retard");
    expect(text).toContain("Claire Martin");
    expect(raw).toContain(`${EMAIL_BRAND.app}/dashboard/invoices/abc`);
    expect(text).toContain("Voir la facture");
  });
});

describe("white-label email (artisan brand → their client)", () => {
  const brand = {
    name: "Plomberie Durand",
    logoUrl: "https://blob.example.com/logo.png",
    color: "#0f766e",
  };
  const base = {
    brand,
    clientName: "Claire Martin",
    invoiceNumber: "F-2026-0042",
    total: "1234.50",
    dueDate: "2026-09-01",
    artisanPhone: "06 12 34 56 78",
  };

  it("InvoiceReminderEmail J+7 carries the artisan's brand, not Traballo's", async () => {
    const { raw, text } = await rendered(
      InvoiceReminderEmail({ ...base, kind: "reminder_j7", daysLate: 7, pdfAttached: true })
    );
    expect(raw).toMatch(/^<!DOCTYPE html/i);
    expect(raw).toContain(brand.logoUrl);
    expect(raw).toContain(brand.color);
    expect(raw).not.toContain(EMAIL_BRAND.logoUrl);
    expect(raw).not.toContain(`${EMAIL_BRAND.app}/dashboard`);
    expect(raw).not.toContain(`mailto:${EMAIL_BRAND.supportEmail}`);
    expect(text).not.toMatch(/Tous droits réservés/);
    expect(text).toMatch(/Plomberie Durand via Traballo/);

    expect(text).toContain("Bonjour Claire Martin");
    expect(text).toContain("F-2026-0042");
    expect(text).toMatch(/1\s234,50\s€/);
    expect(text).toContain("1 septembre 2026");
    expect(text).toMatch(/Sauf erreur/);
    expect(text).toMatch(/jointe/);
    expect(text).toContain("06 12 34 56 78");
    expect(text).not.toContain("undefined");
  });

  it("InvoiceReminderEmail J+30 is firmer", async () => {
    const { text } = await rendered(
      InvoiceReminderEmail({ ...base, kind: "reminder_j30", daysLate: 30, pdfAttached: false })
    );
    expect(text).toMatch(/30 jours/);
    expect(text).toMatch(/meilleurs délais/);
    expect(text).not.toMatch(/jointe/);
  });

  it("works without logo nor phone", async () => {
    const { raw, text } = await rendered(
      InvoiceReminderEmail({
        ...base,
        brand: { name: "X", logoUrl: null, color: EMAIL_BRAND.blue },
        artisanPhone: null,
        kind: "reminder_j7",
        daysLate: 7,
        pdfAttached: false,
      })
    );
    expect(raw).not.toContain("<img");
    expect(text).not.toContain("undefined");
    expect(text).not.toContain("null");
  });

  const payment = { iban: "FR76 3000 6000 0112 3456 7890 189", reference: "F-2026-0042" };

  it("InvoiceReminderEmail shows how to pay when the artisan has an IBAN", async () => {
    const { text } = await rendered(
      InvoiceReminderEmail({ ...base, kind: "reminder_j7", daysLate: 7, pdfAttached: true, payment })
    );
    expect(text).toContain("FR76 3000 6000 0112 3456 7890 189");
    expect(text).toMatch(/Référence/);
    expect(text).toContain("F-2026-0042");
  });

  it("InvoiceReminderEmail has no payment block without IBAN", async () => {
    const { text } = await rendered(
      InvoiceReminderEmail({ ...base, kind: "reminder_j7", daysLate: 7, pdfAttached: true })
    );
    expect(text).not.toMatch(/IBAN/);
  });

  it("manual reminder before the due date is a friendly heads-up", async () => {
    const { text } = await rendered(
      InvoiceReminderEmail({ ...base, kind: "manual", daysLate: -3, pdfAttached: true })
    );
    expect(text).toMatch(/arrive à échéance le 1 septembre 2026/);
    expect(text).not.toMatch(/Sauf erreur/);
  });

  it("manual reminder after the due date reads like the J+7 one", async () => {
    const { text } = await rendered(
      InvoiceReminderEmail({ ...base, kind: "manual", daysLate: 4, pdfAttached: true })
    );
    expect(text).toMatch(/Sauf erreur/);
  });
});

describe("InvoiceEmail — attachment and payment", () => {
  const invoice = {
    invoiceNumber: "F-2026-0042",
    clientName: "Claire Martin",
    total: "1234.50",
    dueDate: "2026-09-01",
    artisanBusinessName: "Plomberie Durand",
  };

  it("says the PDF is attached and never links a data: URL", async () => {
    const { raw, text } = await rendered(
      InvoiceEmail({
        ...invoice,
        pdfUrl: "data:application/pdf;base64,JVBERi0=",
        pdfAttached: true,
        payment: { iban: "FR76 3000 6000 0112 3456 7890 189", reference: "F-2026-0042" },
      })
    );
    expect(text).toMatch(/jointe/);
    expect(raw).not.toContain("data:application/pdf");
    expect(text).not.toMatch(/Télécharger la facture/);
    expect(text).toContain("FR76 3000 6000 0112 3456 7890 189");
  });
});
