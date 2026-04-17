/**
 * src/lib/db/index.ts
 * Drizzle client configuration for Supabase Postgres
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// During Next.js build, DATABASE_URL may not be available
// Use placeholder for build, will error at runtime if not set
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
export const db = drizzle(client, { schema });

// Type export for use in queries
export type DB = typeof db;
