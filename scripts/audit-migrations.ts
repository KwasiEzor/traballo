/**
 * scripts/audit-migrations.ts
 * Audits repository migration metadata and, optionally, the configured database
 * to ensure Drizzle migration history has not drifted.
 *
 * Usage:
 * - `pnpm db:audit:migrations`
 * - `pnpm db:audit:live`
 */

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: ".env.local" });

interface JournalEntry {
  idx: number;
  when: number;
  tag: string;
  breakpoints: boolean;
}

interface JournalFile {
  version: string;
  dialect: string;
  entries: JournalEntry[];
}

const migrationsDir = path.join(process.cwd(), "src/db/migrations");
const journalPath = path.join(migrationsDir, "meta", "_journal.json");
const liveMode = process.argv.includes("--live");

async function main() {
  const journal = readJournal();
  const sqlTags = readSqlTags();

  let issues = 0;

  issues += auditJournalShape(journal);
  issues += auditRepoConsistency(journal.entries, sqlTags);

  if (liveMode) {
    issues += await auditLiveDatabase(journal.entries);
  }

  if (issues > 0) {
    console.error(`\n🚨 Migration audit failed with ${issues} issue(s).`);
    process.exit(1);
  }

  console.log("\n✨ Migration audit passed.");
}

function readJournal(): JournalFile {
  if (!fs.existsSync(journalPath)) {
    throw new Error(`Missing migration journal: ${journalPath}`);
  }

  return JSON.parse(fs.readFileSync(journalPath, "utf8")) as JournalFile;
}

function readSqlTags() {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Missing migrations directory: ${migrationsDir}`);
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .map((file) => file.replace(/\.sql$/, ""))
    .sort();
}

function auditJournalShape(journal: JournalFile) {
  console.log("🔍 Auditing migration journal shape...");
  let issues = 0;

  journal.entries.forEach((entry, index) => {
    if (entry.idx !== index) {
      console.error(
        `❌ Journal entry "${entry.tag}" has idx=${entry.idx}, expected ${index}.`
      );
      issues += 1;
    }
  });

  console.log(
    `✅ Journal contains ${journal.entries.length} ordered migration entr${journal.entries.length === 1 ? "y" : "ies"}.`
  );

  return issues;
}

function auditRepoConsistency(entries: JournalEntry[], sqlTags: string[]) {
  console.log("\n🔍 Auditing repo migration files against journal...");
  let issues = 0;

  const journalTags = entries.map((entry) => entry.tag);
  const missingFromJournal = sqlTags.filter((tag) => !journalTags.includes(tag));
  const missingSqlFiles = journalTags.filter((tag) => !sqlTags.includes(tag));

  if (missingFromJournal.length > 0) {
    console.error(
      `❌ SQL migration files missing from journal: ${missingFromJournal.join(", ")}`
    );
    issues += missingFromJournal.length;
  }

  if (missingSqlFiles.length > 0) {
    console.error(
      `❌ Journal entries missing SQL files: ${missingSqlFiles.join(", ")}`
    );
    issues += missingSqlFiles.length;
  }

  if (missingFromJournal.length === 0 && missingSqlFiles.length === 0) {
    console.log(`✅ Journal and SQL files are in sync (${sqlTags.length} migrations).`);
  }

  return issues;
}

async function auditLiveDatabase(entries: JournalEntry[]) {
  console.log("\n🔍 Auditing applied migrations in live database...");

  if (!process.env.DIRECT_URL) {
    console.error("❌ DIRECT_URL is required for --live migration audit.");
    return 1;
  }

  const sql = postgres(process.env.DIRECT_URL, {
    prepare: false,
    max: 1,
    idle_timeout: 1,
  });

  try {
    const rows = await sql<{ created_at: string | number }[]>`
      select created_at
      from drizzle.__drizzle_migrations
      order by created_at asc
    `;

    const applied = new Set(rows.map((row) => Number(row.created_at)));
    const missing = entries.filter((entry) => !applied.has(entry.when));

    if (missing.length > 0) {
      console.error(
        `❌ Live database is missing migrations: ${missing.map((entry) => entry.tag).join(", ")}`
      );
      return missing.length;
    }

    console.log(
      `✅ Live database has all ${entries.length} journaled Drizzle migrations recorded.`
    );
    return 0;
  } catch (error) {
    console.error(
      "❌ Failed to audit live migration table drizzle.__drizzle_migrations:",
      error
    );
    return 1;
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
