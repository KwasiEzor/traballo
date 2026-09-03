/**
 * src/lib/auth/index.ts
 * Main auth exports
 */

export { auth } from "./better-auth";
export { getCurrentUser, requireSessionUser } from "./session";
export type { SessionUser } from "./session";
export { requireAuth } from "./require-auth";
export type { AuthContext } from "./require-auth";
export { requireAdminAccess, isAdminEmail, parseAdminEmails } from "./admin";
export * from "./tenant";
