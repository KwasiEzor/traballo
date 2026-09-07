/**
 * src/lib/site-phase.ts
 * Product lifecycle phase, read from `NEXT_PUBLIC_SITE_PHASE`.
 *
 * `beta` (default) surfaces the beta badge on the marketing site and the
 * dashboard, plus the dismissible feedback banner in the dashboard. Set it to
 * `ga` (or anything else) at general availability — no code change, just the
 * env var and a redeploy.
 *
 * Client-safe: the value is inlined at build time via the NEXT_PUBLIC_ prefix,
 * so this module can be imported from both server and client components.
 */

export type SitePhase = "beta" | "ga";

export function sitePhase(): SitePhase {
  return process.env.NEXT_PUBLIC_SITE_PHASE === "ga" ? "ga" : "beta";
}

export function isBeta(): boolean {
  return sitePhase() === "beta";
}

/**
 * Absolute URL to the contact form, pre-selecting the beta-feedback topic.
 * Absolute because the banner also renders on `app.` where `/contact` is a
 * different origin (the marketing site).
 */
export function betaFeedbackUrl(): string {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";
  return `https://www.${root}/contact?topic=beta`;
}
