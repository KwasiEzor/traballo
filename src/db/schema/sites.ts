import { pgTable, text, timestamp, uuid, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const sites = pgTable(
  "sites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" })
      .unique(),
    templateId: text("template_id").notNull().default("default"),
    primaryColor: text("primary_color").notNull().default("#3b82f6"),
    customDomain: text("custom_domain"),
    isPublished: boolean("is_published").notNull().default(false),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    sections: jsonb("sections"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("sites_tenant_id_idx").on(table.tenantId),
  })
);

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
