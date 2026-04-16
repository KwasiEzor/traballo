/**
 * src/lib/db/index.ts
 * Drizzle client configuration for Supabase Postgres
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Create postgres client
const client = postgres(process.env.DATABASE_URL, {
  prepare: false, // Required for pgBouncer
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Type export for use in queries
export type DB = typeof db;
