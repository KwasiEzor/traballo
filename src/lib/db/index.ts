/**
 * src/lib/db/index.ts
 * Drizzle client configuration for Supabase Postgres
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// During Next.js build, DATABASE_URL may not be available
const connectionString = process.env.DATABASE_URL || "postgresql://placeholder";

// Create postgres client
const client = postgres(connectionString, {
  prepare: false, // Required for pgBouncer
  onnotice: () => {}, // Suppress notices during build
  connection: {
    connect_timeout: process.env.DATABASE_URL ? 10 : 0,
  },
});

// Create drizzle instance
// NOT EXPORTED BY DEFAULT - Use getTenantDb(tenantId) instead
const internalDb = drizzle(client, { schema });

// Export internal DB for specialized use (e.g., migrations, scripts, tenant resolution)
// DO NOT use in standard application logic
export { internalDb as db };

// Type export for use in queries
export type DB = typeof internalDb;
