/**
 * src/lib/db/index.ts
 * Drizzle client — Neon Postgres (postgres-js driver).
 *
 * Use the POOLED connection string (`...-pooler.<region>.aws.neon.tech`) for
 * DATABASE_URL. Transactions (used by withTenant) work over Neon's pooler.
 * DIRECT_URL (non-pooled) is only used by drizzle-kit for migrations.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// DATABASE_URL may be absent during `next build` (static analysis) — fall back
// to a placeholder so imports don't throw at module load.
const connectionString = process.env.DATABASE_URL || "postgresql://placeholder";
const isRealConnection = Boolean(process.env.DATABASE_URL);

const client = postgres(connectionString, {
  prepare: false, // required for transaction-pooling (pgBouncer / Neon pooler)
  onnotice: () => {},
  connection: {
    connect_timeout: isRealConnection ? 10 : 0,
  },
});

const internalDb = drizzle(client, { schema });

// Exported as `db`: the RLS-bypassing owner connection.
// Use ONLY for auth bootstrap, migrations, scripts and tenant resolution.
// Tenant-scoped application logic must go through withTenant() / getTenantDb().
export { internalDb as db };

export type DB = typeof internalDb;
