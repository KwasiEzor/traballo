/**
 * sentry.edge.config.ts
 * Sentry init for the Edge runtime (middleware, edge routes) — imported by
 * src/instrumentation.ts. https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: 1,
});
