/**
 * Social networks shown in the public-site footer. Kept dependency-free so
 * both the (client) dashboard editor and the (server) site renderer can
 * import it without pulling in the DB layer.
 */

export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "linkedin",
  "tiktok",
  "youtube",
  "google",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_META: Record<
  SocialPlatform,
  { label: string; placeholder: string }
> = {
  facebook: { label: "Facebook", placeholder: "https://facebook.com/votre-page" },
  instagram: {
    label: "Instagram",
    placeholder: "https://instagram.com/votre-compte",
  },
  linkedin: { label: "LinkedIn", placeholder: "https://linkedin.com/company/…" },
  tiktok: { label: "TikTok", placeholder: "https://tiktok.com/@votre-compte" },
  youtube: { label: "YouTube", placeholder: "https://youtube.com/@votre-chaine" },
  google: {
    label: "Fiche Google",
    placeholder: "https://g.page/votre-etablissement",
  },
};

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

/** Accept a bare or full URL; return a safe absolute http(s) URL or null. */
export function normalizeSocialUrl(raw: string | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  const candidate = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}
