import { pgTable, text, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";

/**
 * Every mutating action taken from the super-admin console. Append-only.
 * Not tenant-scoped; read/written only via the owner DB connection.
 * RLS denies the `authenticated` role (migration 0009).
 */
export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    createdAtIdx: index("admin_audit_log_created_at_idx").on(t.createdAt),
    targetIdx: index("admin_audit_log_target_idx").on(t.targetType, t.targetId),
  })
);

export type AdminAuditEntry = typeof adminAuditLog.$inferSelect;
