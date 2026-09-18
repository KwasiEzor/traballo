/**
 * src/app/api/_sentry-wiring-test/route.ts
 * Temporary diagnostic route — throws on purpose to confirm the Sentry
 * server instrumentation actually reports to the project. Delete after use.
 */
export async function GET(): Promise<Response> {
  throw new Error(
    "TRABALLO_SENTRY_WIRING_TEST — deliberate test error, safe to resolve/delete"
  );
}
