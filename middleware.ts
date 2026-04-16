/**
 * middleware.ts
 * Multi-tenant routing middleware
 *
 * Routes requests based on hostname:
 * - app.traballo.be → /dashboard/* (artisan dashboard)
 * - admin.traballo.be → /admin/* (super admin)
 * - [slug].traballo.be → /sites/[slug]/* (public artisan site)
 * - custom.domain → /sites/[slug]/* (resolved via DB)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.be";

  // Admin subdomain → /admin/*
  if (hostname === `admin.${rootDomain}`) {
    if (!url.pathname.startsWith("/admin")) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // App subdomain → /dashboard/*
  if (hostname === `app.${rootDomain}`) {
    if (!url.pathname.startsWith("/dashboard")) {
      url.pathname = `/dashboard${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Artisan subdomain or custom domain → /sites/[slug]/*
  if (hostname.endsWith(`.${rootDomain}`)) {
    const slug = hostname.replace(`.${rootDomain}`, "");

    if (!url.pathname.startsWith("/sites")) {
      url.pathname = `/sites/${slug}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Custom domain (not *.traballo.be)
  // TODO: Query DB to resolve custom domain to slug
  // For now, serve as-is
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
