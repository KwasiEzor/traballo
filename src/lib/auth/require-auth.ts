/**
 * src/lib/auth/require-auth.ts
 * Helper for requiring authentication in Server Actions, routes and RSC.
 */

import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "./session";
import { isAdminEmail } from "./admin";
import { db } from "@/lib/db";
import { users, tenants } from "@/db/schema";
import { currentImpersonation } from "@/lib/admin/impersonation";

export interface AuthContext {
  userId: string;
  tenantId: string;
  email: string;
  plan: "free" | "pro" | "business";
  role: "owner" | "employee";
  status: "active" | "suspended";
  /** True when a super-admin is acting as this tenant. */
  impersonating?: boolean;
  impersonatedBy?: string;
}

/**
 * Require authentication and return context (user + tenant info).
 * Memoized per request so repeated calls in a render tree hit the DB once.
 */
export const requireAuth = cache(async function requireAuth(): Promise<AuthContext> {
  const [user, imp] = await Promise.all([
    getCurrentUser(),
    currentImpersonation(),
  ]);

  // Impersonation: honour the signed token unless a non-admin session holds it.
  if (imp && !(user && !isAdminEmail(user.email))) {
    const t = await db.query.tenants.findFirst({
      where: eq(tenants.id, imp.tenantId),
      with: { users: { limit: 1 } },
    });
    const owner =
      t?.users.find((u) => u.role === "owner") ?? t?.users[0] ?? null;
    if (t && owner) {
      return {
        userId: owner.id,
        tenantId: t.id,
        email: owner.email,
        plan: t.plan,
        role: owner.role,
        status: t.status,
        impersonating: true,
        impersonatedBy: imp.by,
      };
    }
  }

  if (!user || !user.id || !user.email) {
    redirect("/auth/signin");
  }

  const userData = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: { tenant: true },
  });

  if (!userData || !userData.tenant) {
    redirect("/auth/signup");
  }

  return {
    userId: userData.id,
    tenantId: userData.tenantId,
    email: userData.email,
    plan: userData.tenant.plan,
    role: userData.role,
    status: userData.tenant.status,
  };
});
