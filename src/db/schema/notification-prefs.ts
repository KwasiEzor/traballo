import { pgTable, text, uuid, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenants";
import { users } from "./users";

/**
 * Per-user, per-category channel toggles. Missing row == all channels on
 * (see `src/lib/notifications/prefs.ts` defaults). Only categories a user
 * has touched get a row, so most users have none.
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
    email: boolean("email").notNull().default(true),
    inApp: boolean("in_app").notNull().default(true),
    push: boolean("push").notNull().default(true),
    sms: boolean("sms").notNull().default(true),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.category] }),
  })
);

export const notificationPrefsRelations = relations(notificationPrefs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [notificationPrefs.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [notificationPrefs.userId],
    references: [users.id],
  }),
}));

export type NotificationPref = typeof notificationPrefs.$inferSelect;
export type NewNotificationPref = typeof notificationPrefs.$inferInsert;
