/**
 * src/lib/auth/client.ts
 * Better Auth browser client for use in Client Components.
 */

"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [magicLinkClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
