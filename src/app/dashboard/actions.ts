"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/better-auth";
import {
  currentImpersonation,
  clearImpersonation,
} from "@/lib/admin/impersonation";
import { logAdminAction } from "@/lib/admin/audit";

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/auth/signin");
}

/**
 * Ends an impersonation session. Authorised by possession of the signed token
 * (minted only behind requireAdminAccess). Sends the admin back to the console.
 */
export async function stopImpersonationAction() {
  const imp = await currentImpersonation();
  await clearImpersonation();
  if (imp) {
    await logAdminAction({
      actorEmail: imp.by,
      action: "tenant.impersonation_stopped",
      targetType: "tenant",
      targetId: imp.tenantId,
    });
  }
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  redirect(
    rootDomain && process.env.NODE_ENV === "production"
      ? `https://admin.${rootDomain}/tenants`
      : "/admin/tenants"
  );
}
