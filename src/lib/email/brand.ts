/**
 * Shared brand constants for every Traballo email.
 */

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";

export const EMAIL_BRAND = {
  name: "Traballo",
  tagline: "Le business pack des artisans",
  regions: "France · Belgique · Luxembourg",

  // Colours (hex — email clients don't do OKLCH).
  blue: "#155BA2",
  blueDark: "#0F3F73",
  ink: "#111827",
  body: "#374151",
  muted: "#6b7280",
  faint: "#9ca3af",
  border: "#e5e7eb",
  surface: "#ffffff",
  page: "#f4f6f8",

  logoUrl: `https://www.${ROOT}/icon-192.png`,
  site: `https://www.${ROOT}`,
  app: process.env.NEXT_PUBLIC_APP_URL || `https://app.${ROOT}`,
  supportEmail: "aide@traballo.pro",
} as const;

/** Identity shown on e-mails sent on the artisan's behalf to their clients. */
export type EmailBrand = {
  name: string;
  logoUrl: string | null;
  color: string;
};

/**
 * The artisan's brand for white-label e-mails. The logo and colour end up in
 * HTML attributes / inline styles: only an https URL and a `#rrggbb` colour
 * are kept, anything else falls back to Traballo's defaults.
 */
export function artisanBrand({
  businessName,
  logoUrl,
  primaryColor,
}: {
  businessName: string;
  logoUrl: string | null;
  primaryColor: string | null;
}): EmailBrand {
  return {
    name: businessName,
    logoUrl: logoUrl && /^https:\/\/[^\s"'<>]+$/.test(logoUrl) ? logoUrl : null,
    color:
      primaryColor && /^#[0-9a-fA-F]{6}$/.test(primaryColor)
        ? primaryColor
        : EMAIL_BRAND.blue,
  };
}

/**
 * `From` header for a white-label mail: the artisan's name, Traballo's
 * sending address (the only verified domain). Quotes, angle brackets,
 * backslashes and line breaks are stripped so a business name can neither
 * break the quoting nor inject headers.
 */
export function artisanSender(businessName: string): string {
  const configured = process.env.EMAIL_FROM?.match(/<([^<>\s]+@[^<>\s]+)>/)?.[1];
  const address = configured ?? "noreply@traballo.pro";
  const name = businessName.replace(/["<>\\\r\n]/g, "").replace(/\s+/g, " ").trim();
  return `"${name} via Traballo" <${address}>`;
}
