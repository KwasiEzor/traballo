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
