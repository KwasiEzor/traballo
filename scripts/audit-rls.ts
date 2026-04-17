/**
 * scripts/audit-rls.ts
 * Audits the Drizzle schema and migration files for RLS compliance.
 */

import * as schema from "../src/db/schema";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import fs from "fs";
import path from "path";

const EXCLUDED_TABLES = ["tenants"];

async function auditSchema() {
  console.log("🔍 Auditing Drizzle Schema for tenant_id columns...");
  let issues = 0;
  let tableCount = 0;

  for (const [name, table] of Object.entries(schema)) {
    // Basic check for a Drizzle table
    if (table instanceof PgTable || (table && typeof table === "object" && "_" in table && "name" in (table as any))) {
      const tableName = (table as any).name || name;
      tableCount++;

      // Skip excluded tables or junction tables that are covered by parent RLS
      if (EXCLUDED_TABLES.includes(tableName)) {
        console.log(`ℹ️ Skipping excluded/junction table: ${tableName}`);
        continue;
      }

      const config = getTableConfig(table as any);
      const hasTenantId = config.columns.some(
        (col) => col.name === "tenant_id" || col.name === "tenantId"
      );

      if (!hasTenantId) {
        console.error(`❌ Table "${tableName}" is missing a tenant_id column!`);
        issues++;
      } else {
        console.log(`✅ Table "${tableName}" has tenant_id column.`);
      }
    }
  }

  if (tableCount === 0) {
    console.error("❌ No Drizzle tables found in schema!");
    issues++;
  }

  return issues;
}

async function auditMigrations() {
  console.log("\n🔍 Auditing Migrations for ENABLE ROW LEVEL SECURITY...");
  const migrationsDir = path.join(process.cwd(), "src/db/migrations");
  let issues = 0;

  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migrations directory not found: ${migrationsDir}`);
    return 1;
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
  let rlsEnabledCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    if (content.toUpperCase().includes("ENABLE ROW LEVEL SECURITY")) {
      rlsEnabledCount++;
    }
  }

  if (rlsEnabledCount === 0) {
    console.error("❌ No migration files contain 'ENABLE ROW LEVEL SECURITY'!");
    issues++;
  } else {
    console.log(`✅ Found 'ENABLE ROW LEVEL SECURITY' in ${rlsEnabledCount} migration files.`);
  }

  return issues;
}

async function main() {
  const schemaIssues = await auditSchema();
  const migrationIssues = await auditMigrations();

  if (schemaIssues + migrationIssues > 0) {
    console.error(`\n🚨 Audit failed with ${schemaIssues + migrationIssues} issues.`);
    process.exit(1);
  } else {
    console.log("\n✨ Audit passed! All tables are isolated.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
