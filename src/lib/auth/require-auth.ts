/**
 * src/lib/auth/require-auth.ts
 * Helper for requiring authentication in Server Actions, routes and RSC.
 */

import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "./session";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export interface AuthContext {
  userId: string;
  tenantId: string;
  email: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  role: "owner" | "employee";
}

/**
 * Require authentication and return context (user + tenant info).
 * Memoized per request so repeated calls in a render tree hit the DB once.
 */
export const requireAuth = cache(async function requireAuth(): Promise<AuthContext> {
  const user = await getCurrentUser();

  if (!user || !user.id || !user.email) {
    redirect("/auth/signin");
  }

  const userData = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: { tenant: true },
  });

  if (!userData || !userData.tenant) {
    // Auth identity exists but no tenant membership yet — finish onboarding.
    redirect("/auth/signup");
  }

  return {
    userId: userData.id,
    tenantId: userData.tenantId,
    email: userData.email,
    plan: userData.tenant.plan,
    role: userData.role,
  };
});
