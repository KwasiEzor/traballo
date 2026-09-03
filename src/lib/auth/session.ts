/**
 * src/lib/auth/session.ts
 * Server-side session helpers backed by Better Auth.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./better-auth";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
};

/**
 * Current authenticated user, or null.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return (session?.user as SessionUser | undefined) ?? null;
}

/**
 * Require an authenticated user or redirect to sign-in.
 * Use in protected routes / server components.
 */
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }
  return user;
}
