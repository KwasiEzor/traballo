/**
 * middleware.ts
 * Multi-tenant routing + optimistic auth guard.
 *
 * Hostname routing:
 * - app.traballo.pro    → /dashboard/*  (artisan dashboard, auth required)
 * - admin.traballo.pro  → /admin/*      (super admin, auth required)
 * - [slug].traballo.pro → /sites/[slug]/*  (public artisan site)
 * - custom domain        → /sites/[slug]/* (resolved in the route via DB)
 *
 * The session cookie check here is optimistic only. Authorisation is enforced
 * server-side by requireAuth() / requireAdminAccess().
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = (request.headers.get("host") || "").split(":")[0];
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";

  const hasSession = Boolean(getSessionCookie(request));

  const requireSession = (rewrittenPath: string) => {
    if (!hasSession) {
      const signin = new URL("/auth/signin", url);
      signin.searchParams.set("redirectTo", rewrittenPath);
      return NextResponse.redirect(signin);
    }
    return null;
  };

  // Admin subdomain → /admin/*
  if (hostname === `admin.${rootDomain}`) {
    const target = url.pathname.startsWith("/admin")
      ? url.pathname
      : `/admin${url.pathname}`;
    if (!url.pathname.startsWith("/auth")) {
      const gate = requireSession(target);
      if (gate) return gate;
    }
    if (target !== url.pathname) {
      url.pathname = target;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // App subdomain → /dashboard/*
  if (hostname === `app.${rootDomain}`) {
    const isAuthRoute = url.pathname.startsWith("/auth");
    // Real top-level routes on this host that must NOT be prefixed with
    // /dashboard: the dashboard itself, the auth pages, the onboarding wizard,
    // the owner-only site preview, and the super-admin console (so an admin who
    // signs in here isn't bounced to another origin).
    const isTopLevel =
      isAuthRoute ||
      url.pathname === "/onboarding" ||
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/onboarding/") ||
      url.pathname === "/site-preview" ||
      url.pathname.startsWith("/site-preview/") ||
      url.pathname === "/admin" ||
      url.pathname.startsWith("/admin/");
    const target = isTopLevel ? url.pathname : `/dashboard${url.pathname}`;
    if (!isAuthRoute) {
      const gate = requireSession(target);
      if (gate) return gate;
    }
    if (target !== url.pathname) {
      url.pathname = target;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Artisan subdomain → /sites/[slug]/*
  if (hostname.endsWith(`.${rootDomain}`)) {
    const slug = hostname.replace(`.${rootDomain}`, "");
    if (slug && slug !== "www" && !url.pathname.startsWith("/sites")) {
      url.pathname = `/sites/${slug}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Root domain, localhost, Vercel previews, or a not-yet-supported custom
  // domain: serve as-is. Custom-domain → slug resolution is a separate task.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
