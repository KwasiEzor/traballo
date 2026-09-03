"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/better-auth";

/**
 * Start the Google OAuth flow. Better Auth returns the provider URL; we
 * redirect the browser to it. The create-user hook provisions the tenant on
 * first sign-in (see src/lib/tenant/provision.ts).
 */
export async function signInWithGoogle() {
  const res = await auth.api.signInSocial({
    body: { provider: "google", callbackURL: "/dashboard" },
    headers: await headers(),
  });

  if (res.url) {
    redirect(res.url);
  }

  redirect("/auth/signin?error=" + encodeURIComponent("Google indisponible"));
}
