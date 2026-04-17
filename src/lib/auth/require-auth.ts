/**
 * src/lib/auth/require-auth.ts
 * Helper for requiring authentication in Server Actions and routes
 */

import { getCurrentUser } from "./supabase-server";
import { db } from "@/lib/db";
import { users, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export interface AuthContext {
  userId: string;
  tenantId: string;
  email: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  role: "owner" | "employee";
}

/**
 * Require authentication and return context (user + tenant info)
 * Used in Server Actions
 */
export async function requireAuth(): Promise<AuthContext> {
  const user = await getCurrentUser();

  if (!user || !user.id || !user.email) {
    redirect("/auth/signin");
  }

  // Get tenant ID and plan from our database
  // In a real app, we might cache this in the JWT or use a session
  const userData = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      tenant: true,
    },
  });

  if (!userData || !userData.tenant) {
    // This could happen if the user exists in Supabase but not our 'users' table
    // or if the tenant was deleted.
    redirect("/auth/signup");
  }

  return {
    userId: userData.id,
    tenantId: userData.tenantId,
    email: userData.email,
    plan: (userData.tenant.plan as any) || "free",
    role: (userData.role as any) || "owner",
  };
}
