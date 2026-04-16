/**
 * src/lib/auth/tenant.ts
 * Tenant context helpers for multi-tenant isolation
 *
 * CRITICAL: Always use getTenantId() before any DB operation
 * to ensure tenant isolation
 */

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { tenants, sites } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get current tenant ID from request context
 * Extracts from subdomain or custom domain
 *
 * @returns tenantId (UUID) or null if not found
 */
export async function getTenantId(): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get("host");

  if (!host) {
    return null;
  }

  // Remove port if present (localhost:3000 -> localhost)
  const hostname = host.split(":")[0];
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.be";

  // Check for subdomain (e.g., slug.traballo.be)
  if (hostname.endsWith(`.${rootDomain}`)) {
    const slug = hostname.replace(`.${rootDomain}`, "");

    // Query DB to get tenant_id from slug
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
      columns: { id: true },
    });

    return tenant?.id || null;
  }

  // Check for custom domain
  const site = await db.query.sites.findFirst({
    where: eq(sites.customDomain, hostname),
    columns: { tenantId: true },
  });

  return site?.tenantId || null;
}

/**
 * Require tenant ID or throw error
 * Use in protected routes where tenant context is mandatory
 */
export async function requireTenantId(): Promise<string> {
  const tenantId = await getTenantId();

  if (!tenantId) {
    throw new Error("Tenant context required but not found");
  }

  return tenantId;
}
