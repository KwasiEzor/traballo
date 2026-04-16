import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const artisanProfiles = pgTable(
  "artisan_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    ownerName: text("owner_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    whatsappNumber: text("whatsapp_number"),
    address: text("address"),
    vatNumber: text("vat_number"),
    iban: text("iban"),
    logoUrl: text("logo_url"),
    tradeType: text("trade_type"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("artisan_profiles_tenant_id_idx").on(table.tenantId),
  })
);

export type ArtisanProfile = typeof artisanProfiles.$inferSelect;
export type NewArtisanProfile = typeof artisanProfiles.$inferInsert;
