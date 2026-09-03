/**
 * Better Auth catch-all route handler.
 * Serves /api/auth/* (sign-in, sign-up, callbacks, session, ...).
 */

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/better-auth";

export const { GET, POST } = toNextJsHandler(auth);
