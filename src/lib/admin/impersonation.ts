/**
 * src/lib/admin/impersonation.ts
 * Lightweight support impersonation. An admin action mints a short-lived
 * HMAC-signed token naming the tenant to act as; the dashboard's requireAuth()
 * honours it. The token is only ever minted behind requireAdminAccess(), so
 * holding a valid one proves prior authorisation.
 *
 * Cookie: `traballo_imp` — httpOnly, secure, SameSite=Lax, domain=.<root> in
 * prod so it is readable on app.<root> after the admin redirects there.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const IMP_COOKIE = "traballo_imp";
const TTL_MS = 60 * 60 * 1000; // 60 min

export type ImpersonationToken = {
  tenantId: string;
  by: string; // admin email
  exp: number;
};

function secret(): string {
  const s = process.env.BETTER_AUTH_SECRET;
  if (!s) throw new Error("BETTER_AUTH_SECRET required for impersonation.");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encode(t: ImpersonationToken): string {
  const payload = Buffer.from(JSON.stringify(t)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyImpToken(raw: string | undefined): ImpersonationToken | null {
  if (!raw) return null;
  const [payload, mac] = raw.split(".");
  if (!payload || !mac) return null;
  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const t = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as ImpersonationToken;
    if (!t.tenantId || !t.by || typeof t.exp !== "number") return null;
    if (Date.now() > t.exp) return null;
    return t;
  } catch {
    return null;
  }
}

function cookieDomain(): string | undefined {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  // Only set a parent-domain cookie in prod; localhost gets a host cookie.
  return root && process.env.NODE_ENV === "production" ? `.${root}` : undefined;
}

export async function setImpersonation(tenantId: string, by: string): Promise<void> {
  const token = encode({ tenantId, by, exp: Date.now() + TTL_MS });
  (await cookies()).set(IMP_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: cookieDomain(),
    maxAge: TTL_MS / 1000,
  });
}

export async function clearImpersonation(): Promise<void> {
  (await cookies()).set(IMP_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: cookieDomain(),
    maxAge: 0,
  });
}

/** Reads + verifies the current impersonation token, if any. */
export async function currentImpersonation(): Promise<ImpersonationToken | null> {
  const raw = (await cookies()).get(IMP_COOKIE)?.value;
  return verifyImpToken(raw);
}
