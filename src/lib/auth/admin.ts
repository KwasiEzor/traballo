/**
 * Admin-only access helpers.
 *
 * Admin authorization is intentionally explicit and separate from tenant auth.
 * Access is granted to authenticated users whose email is listed in ADMIN_EMAILS.
 */

import { forbidden } from "next/navigation";
import { requireSessionUser } from "./supabase-server";

export function parseAdminEmails(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(
  email: string | null | undefined,
  adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS)
) {
  if (!email) {
    return false;
  }

  return adminEmails.includes(email.trim().toLowerCase());
}

export async function requireAdminAccess() {
  const user = await requireSessionUser();

  if (!user || !isAdminEmail(user.email)) {
    forbidden();
  }

  return user;
}
