import { pgTable, text, timestamp, uuid, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const aiAgentConfig = pgTable(
  "ai_agent_config",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" })
      .unique(),
    agentName: text("agent_name").notNull(),
    isEnabled: boolean("is_enabled").notNull().default(true),
    tone: text("tone").notNull().default("professional"),
    languages: jsonb("languages").notNull().default(["fr"]),
    businessContext: text("business_context"),
    openingMessage: text("opening_message"),
    offHoursMessage: text("off_hours_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("ai_agent_config_tenant_id_idx").on(table.tenantId),
  })
);

export type AiAgentConfig = typeof aiAgentConfig.$inferSelect;
export type NewAiAgentConfig = typeof aiAgentConfig.$inferInsert;
