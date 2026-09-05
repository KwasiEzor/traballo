/**
 * src/lib/security/turnstile.ts
 * Cloudflare Turnstile — server-side token verification for public forms.
 *
 * `TURNSTILE_SITE_KEY`    — public, rendered in the browser widget.
 * `TURNSTILE_SITE_SECRET` — private, used here to validate the token.
 * `TURNSTILE_HOSTNAMES`   — optional, comma-separated allow-list. When set,
 *                          the hostname Cloudflare reports for the token must
 *                          be one of these (defence against token replay from
 *                          another site). Never include localhost.
 *
 * Policy: only an explicit negative verdict from Cloudflare — token rejected,
 * wrong action, or wrong hostname — blocks a submission. A missing token
 * (ad-blocker, widget failed to load, hostname not yet allow-listed) or an
 * unreachable Cloudflare falls through to the honeypot, which is the
 * always-on baseline: a broken widget must never take the form down with it.
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

type SiteverifyResponse = {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

export function turnstileSiteKey(): string {
  if (wantsTestKeys()) return TEST_SITE_KEY;
  return process.env.TURNSTILE_SITE_KEY ?? "";
}

export function turnstileEnabled(): boolean {
  return wantsTestKeys() || Boolean(process.env.TURNSTILE_SITE_SECRET);
}

function allowedHostnames(): string[] {
  return (process.env.TURNSTILE_HOSTNAMES ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

export async function verifyTurnstile(
  token: string,
  opts: { remoteIp?: string; expectedAction?: string } = {}
): Promise<TurnstileResult> {
  const secret = wantsTestKeys()
    ? TEST_SECRET
    : process.env.TURNSTILE_SITE_SECRET;
  if (!secret) return { success: true, reason: "disabled" };
  if (!token) return { success: false, reason: "missing" };

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (opts.remoteIp) body.append("remoteip", opts.remoteIp);

  let data: SiteverifyResponse;
  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    if (!res.ok) return { success: false, reason: "unreachable" };
    data = (await res.json()) as SiteverifyResponse;
  } catch {
    return { success: false, reason: "unreachable" };
  }

  if (data.success !== true) return { success: false, reason: "rejected" };

  // Dummy test keys resolve on any host/action — skip the strict checks.
  if (wantsTestKeys()) return { success: true, reason: "ok" };

  if (
    opts.expectedAction &&
    data.action &&
    data.action !== opts.expectedAction
  ) {
    return { success: false, reason: "rejected" };
  }

  const hosts = allowedHostnames();
  if (hosts.length && data.hostname) {
    const h = data.hostname.toLowerCase();
    const ok = hosts.some((allowed) => h === allowed || h.endsWith(`.${allowed}`));
    if (!ok) return { success: false, reason: "rejected" };
  }

  return { success: true, reason: "ok" };
}
