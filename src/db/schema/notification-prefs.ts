import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

/**
 * Per-user notification preferences, one row per (user, category). No row
 * means the catalogue defaults (everything on). Only the categories the
 * artisan can tune are stored (`CONFIGURABLE_CATEGORIES` in
 * src/lib/notifications/types.ts); `category` is validated with Zod on write.
 *
 * Tenant-scoped (RLS select / insert / update, migration 0012). Read and
 * written from the dashboard through `withTenant`; read at delivery time by
 * `createNotification` through the owner connection with an explicit
 * `tenant_id` filter.
 */
export const notificationPrefs = pgTable(
  "notification_prefs",
  {
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    inApp: boolean("in_app").notNull().default(true),
    email: boolean("email").notNull().default(true),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.category] }),
    tenantIdIdx: index("notification_prefs_tenant_id_idx").on(t.tenantId),
  })
);

export type NotificationPref = typeof notificationPrefs.$inferSelect;
export type NewNotificationPref = typeof notificationPrefs.$inferInsert;
