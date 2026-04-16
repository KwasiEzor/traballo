import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    visitorId: text("visitor_id").notNull(),
    leadName: text("lead_name"),
    leadEmail: text("lead_email"),
    leadPhone: text("lead_phone"),
    channel: text("channel").notNull().default("web"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("ai_conversations_tenant_id_idx").on(table.tenantId),
  })
);

export type AiConversation = typeof aiConversations.$inferSelect;
export type NewAiConversation = typeof aiConversations.$inferInsert;
