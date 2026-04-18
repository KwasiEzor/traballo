/**
 * src/lib/db/tenant.ts
 * Tenant-aware database operations with automatic RLS context
 */

import { db, type DB } from "./index";
import { sql } from "drizzle-orm";
import { requireAuth } from "../auth/require-auth";

/**
 * Execute a DB operation within a tenant-scoped transaction
 * This is the most secure way to ensure RLS context is set correctly
 * for the duration of the operation and isolated from other connections.
 */
export async function withTenant<T>(
  tenantId: string,
  operation: (tx: DB) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    // Drop into the non-bypass role so tenant-scoped queries are actually
    // constrained by Postgres RLS instead of inheriting postgres-level bypass.
    await tx.execute(sql.raw("SET LOCAL ROLE authenticated"));

    // Set tenant context for RLS - using SET LOCAL within transaction
    await tx.execute(sql`SET LOCAL app.current_tenant_id = ${tenantId}`);
    return await operation(tx as any);
  });
}

/**
 * Higher-level helper that gets the current authenticated tenant
 * and returns a DB client scoped to that tenant.
 * Use this in Server Actions and protected routes.
 */
export async function getTenantDb() {
  const { tenantId } = await requireAuth();
  return createTenantClient(tenantId);
}

/**
 * Creates a tenant-scoped DB client instance
 */
export function createTenantClient(tenantId: string) {
  return {
    query: new Proxy(db.query, {
      get(target, prop) {
        const original = (target as any)[prop];
        if (typeof original === "object" && original !== null) {
          return new Proxy(original, {
            get(queryTarget, queryProp) {
              const queryFn = (queryTarget as any)[queryProp];
              if (typeof queryFn === "function") {
                return async (...args: any[]) => {
                  return withTenant(tenantId, (tx) =>
                    (tx.query as any)[prop][queryProp](...args)
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
    // Direct builders
    insert: (table: any) => ({
      values: (values: any) => ({
        returning: () => withTenant(tenantId, (tx) => tx.insert(table).values(values).returning() as any)
      })
    }),
    update: (table: any) => ({
      set: (values: any) => ({
        where: (condition: any) => ({
           returning: () => withTenant(tenantId, (tx) => tx.update(table).set(values).where(condition).returning() as any)
        })
      })
    }),
    delete: (table: any) => ({
      where: (condition: any) => ({
        returning: () => withTenant(tenantId, (tx) => tx.delete(table).where(condition).returning() as any)
      })
    }),
    // The "Gold Standard" for complex operations
    transaction: <T>(fn: (tx: DB) => Promise<T>): Promise<T> => withTenant(tenantId, fn)
  };
}
