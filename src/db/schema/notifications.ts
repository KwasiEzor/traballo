import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenants";
import { users } from "./users";

/**
 * In-app notification feed. One row per recipient. Tenant-scoped (RLS
 * `tenant_isolation`, migration 0010). `userId` null means the notification
 * is addressed to the whole tenant (any owner sees it).
 *
 * Written through the owner connection from server actions / API routes /
 * webhooks via src/lib/notifications/create.ts. RLS is the read-side guard
 * for the dashboard.
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    data: jsonb("data").$type<Record<string, unknown>>(),
    actionUrl: text("action_url"),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    tenantIdIdx: index("notifications_tenant_id_idx").on(t.tenantId),
    feedIdx: index("notifications_feed_idx").on(
      t.userId,
      t.readAt,
      t.createdAt
    ),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  tenant: one(tenants, {
    fields: [notifications.tenantId],
    references: [tenants.id],
  }),
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

/**
 * Idempotency ledger for scheduled / fan-out sends (invoice reminders,
 * appointment reminders, digests). Before sending, check for an existing
 * row keyed by (entityType, entityId, kind, channel); after sending, insert
 * one. A re-run of a cron then never double-sends.
 *
 * Not tenant-scoped for querying convenience in cron jobs; owner connection
 * only, RLS denies `authenticated` (migration 0010).
 */
export const notificationDeliveries = pgTable(
  "notification_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    kind: text("kind").notNull(),
    channel: text("channel").notNull(),
    status: text("status", {
      enum: ["sent", "failed", "skipped"],
    })
      .notNull()
      .default("sent"),
    detail: text("detail"),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (t) => ({
    uniq: unique("notification_deliveries_uniq").on(
      t.entityType,
      t.entityId,
      t.kind,
      t.channel
    ),
    tenantIdIdx: index("notification_deliveries_tenant_id_idx").on(t.tenantId),
  })
);

export type NotificationDelivery = typeof notificationDeliveries.$inferSelect;
export type NewNotificationDelivery =
  typeof notificationDeliveries.$inferInsert;
