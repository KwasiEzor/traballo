import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

/**
 * Sentry's own captureRequestError schedules its flush via Vercel's
 * waitUntil, but that helper is a no-op outside the Edge runtime (see
 * @sentry/core's vercelWaitUntil — it bails unless `typeof EdgeRuntime ===
 * "string"`). On the Node.js runtime, which every route in this app uses,
 * the in-flight HTTP request to Sentry's ingest server gets dropped the
 * moment the lambda freezes right after the response is sent, so errors
 * never show up in Sentry. next/server's after() works on both runtimes
 * and actually keeps the function alive long enough to flush.
 */
export function onRequestError(
  ...args: Parameters<typeof Sentry.captureRequestError>
): void {
  Sentry.captureRequestError(...args);
  after(() => Sentry.flush(2000));
}
