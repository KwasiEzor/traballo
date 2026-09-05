/**
 * src/lib/security/turnstile.ts
 * Cloudflare Turnstile — server-side token verification for public forms.
 *
 * `TURNSTILE_SITE_KEY`    — public, rendered in the browser widget.
 * `TURNSTILE_SITE_SECRET` — private, used here to validate the token.
 *
 * When the secret is absent (local dev without keys) verification is skipped
 * so forms stay usable; the honeypot field remains the baseline defence.
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

export type TurnstileResult = { success: boolean; skipped?: boolean };

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
  if (!secret) return { success: true, skipped: true };
  if (!token) return { success: false };

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    if (!res.ok) return { success: false };
    const data = (await res.json()) as { success?: boolean };
    return { success: data.success === true };
  } catch {
    return { success: false };
  }
}
