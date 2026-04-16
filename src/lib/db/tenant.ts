/**
 * src/lib/db/tenant.ts
 * Tenant-aware database operations with automatic RLS context
 */

import { db } from "./index";
import { sql } from "drizzle-orm";

/**
 * Execute a DB operation with tenant context set for RLS
 * Sets app.current_tenant_id session variable for RLS policies
 *
 * @param tenantId - UUID of the tenant
 * @param operation - Database operation to execute
 */
export async function withTenantContext<T>(
  tenantId: string,
  operation: (db: typeof db) => Promise<T>
): Promise<T> {
  // Set tenant context for RLS
  await db.execute(sql`SET LOCAL app.current_tenant_id = ${tenantId}`);

  try {
    return await operation(db);
  } finally {
    // Clear context after operation
    await db.execute(sql`RESET app.current_tenant_id`);
  }
}

/**
 * Get a tenant-scoped DB instance
 * Wraps all queries with tenant context
 *
 * Usage:
 * ```ts
 * const tenantDb = getTenantDb(tenantId);
 * const invoices = await tenantDb.query.invoices.findMany();
 * ```
 */
export function getTenantDb(tenantId: string) {
  return {
    async transaction<T>(fn: (tx: typeof db) => Promise<T>): Promise<T> {
      return withTenantContext(tenantId, (db) => db.transaction(fn));
    },
    query: new Proxy(db.query, {
      get(target, prop) {
        const original = target[prop as keyof typeof target];
        if (typeof original === "object" && original !== null) {
          return new Proxy(original, {
            get(queryTarget, queryProp) {
              const queryFn = (queryTarget as any)[queryProp];
              if (typeof queryFn === "function") {
                return async (...args: any[]) => {
                  return withTenantContext(tenantId, () =>
                    queryFn.apply(queryTarget, args)
                  );
                };
              }
              return queryFn;
            },
          });
        }
        return original;
      },
    }),
  };
}
