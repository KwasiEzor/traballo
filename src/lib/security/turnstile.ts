/**
 * src/lib/security/turnstile.ts
 * Cloudflare Turnstile — server-side token verification for public forms.
 *
 * `TURNSTILE_SITE_KEY`    — public, rendered in the browser widget.
 * `TURNSTILE_SITE_SECRET` — private, used here to validate the token.
 *
 * Policy: only an explicit "rejected" verdict from Cloudflare blocks a
 * submission. A missing token (ad-blocker, widget failed to load, hostname
 * not yet allow-listed) or an unreachable Cloudflare falls through to the
 * honeypot, which is the always-on baseline — a broken widget must never
 * take the contact form down with it.
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cloudflare's official dummy keys — "always passes". Used off-production so
// the widget renders on localhost (real keys are domain-locked to traballo.pro).
const TEST_SITE_KEY = "1x00000000000000000000AA";
const TEST_SECRET = "1x0000000000000000000000000000000AA";

function wantsTestKeys(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.TURNSTILE_FORCE_REAL !== "1"
  );
}

export type TurnstileReason =
  | "ok"
  | "disabled"
  | "missing"
  | "unreachable"
  | "rejected";

export type TurnstileResult = { success: boolean; reason: TurnstileReason };

export function turnstileSiteKey(): string {
  if (wantsTestKeys()) return TEST_SITE_KEY;
  return process.env.TURNSTILE_SITE_KEY ?? "";
}

export function turnstileEnabled(): boolean {
  return wantsTestKeys() || Boolean(process.env.TURNSTILE_SITE_SECRET);
}

export async function verifyTurnstile(
  token: string,
  remoteIp?: string
): Promise<TurnstileResult> {
  const secret = wantsTestKeys()
    ? TEST_SECRET
    : process.env.TURNSTILE_SITE_SECRET;
  if (!secret) return { success: true, reason: "disabled" };
  if (!token) return { success: false, reason: "missing" };

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    if (!res.ok) return { success: false, reason: "unreachable" };
    const data = (await res.json()) as { success?: boolean };
    return data.success === true
      ? { success: true, reason: "ok" }
      : { success: false, reason: "rejected" };
  } catch {
    return { success: false, reason: "unreachable" };
  }
}
