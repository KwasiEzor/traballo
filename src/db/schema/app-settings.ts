import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Platform-global key/value settings, managed from the admin console.
 * NOT tenant-scoped. Secret values (e.g. the Anthropic API key) are stored
 * encrypted — see src/lib/crypto.ts. Read only through the owner DB
 * connection; RLS denies the `authenticated` role entirely (migration 0008).
 */
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AppSetting = typeof appSettings.$inferSelect;
