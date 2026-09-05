/**
 * Super-admin console home. Reachable both at `admin.<root>` and, so a
 * super-admin signing in on the app subdomain doesn't have to re-auth, at
 * `app.<root>/admin` (the middleware serves `/admin` as a top-level route on
 * both hosts). A same-origin path works from wherever the caller is.
 */
export function adminHome(): string {
  return "/admin";
}
