import { timingSafeEqual } from "node:crypto";

/**
 * Guard for Vercel Cron routes: Vercel sends `Authorization: Bearer
 * $CRON_SECRET`. Returns the response to send back when the call is not
 * allowed (503 without a configured secret, 401 otherwise), null when it is.
 */
export function cronGuard(request: Request): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("Cron non configuré.", { status: 503 });
  const got = Buffer.from(request.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  if (got.length !== want.length || !timingSafeEqual(got, want)) {
    return new Response("Non autorisé.", { status: 401 });
  }
  return null;
}
