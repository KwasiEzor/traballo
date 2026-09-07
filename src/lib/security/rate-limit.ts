/**
 * src/lib/security/rate-limit.ts
 * Best-effort in-memory fixed-window rate limiter.
 *
 * State lives in the module scope of a single server instance. On Vercel
 * Fluid Compute an instance is reused across many requests, so this catches
 * the common case (one client hammering one endpoint) cheaply and with zero
 * infrastructure — but it is NOT a cross-instance guarantee. The authoritative
 * edge layer is a Vercel Firewall rate-limit rule; the hard business guarantee
 * is the per-tenant daily cap in `lead-cap.ts`. This is the middle layer.
 *
 * The bucket map is self-bounded: expired entries are swept on write and the
 * map is hard-capped so a spoofed-key flood cannot grow it without limit.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 20_000;

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

function sweep(now: number): void {
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
  // Still oversized after removing expired entries — drop everything rather
  // than let an attacker pin unbounded memory. Legit clients just get a fresh
  // window on their next request.
  if (buckets.size > MAX_BUCKETS) buckets.clear();
}

/**
 * Count one hit against `key`. Returns `ok: false` once `limit` is exceeded
 * within the current `windowMs`, with the seconds until the window resets.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) sweep(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSec: 0 };
}

/** Test-only: wipe all buckets. */
export function __resetRateLimits(): void {
  buckets.clear();
}

/**
 * Best-effort client IP from proxy headers. Vercel sets `x-forwarded-for`
 * (client first) and `x-real-ip`. Returns `"unknown"` when neither is present
 * so callers always have a usable, non-empty key.
 */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
