import { pgTable, text, timestamp, uuid, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenants";
import { users } from "./users";

/**
 * Browser push subscriptions (Web Push / VAPID) — TRB-115. One row per
 * device/browser a user granted permission on; a user can have several.
 * Written by the settings screen when a "push" preference is switched on
 * (through `withTenant`, RLS-scoped); purged by `sendPush` on a 404/410
 * response from the push service (subscription expired/revoked).
 */
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    endpointUniq: unique("push_subscriptions_endpoint_uniq").on(t.endpoint),
    tenantIdIdx: index("push_subscriptions_tenant_id_idx").on(t.tenantId),
    userIdIdx: index("push_subscriptions_user_id_idx").on(t.userId),
  })
);

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [pushSubscriptions.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
