import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  doublePrecision,
  boolean,
} from "drizzle-orm/pg-core";
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
    /** Geocoded from `address` on save (Stadia Maps) — drives the map section. */
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    vatNumber: text("vat_number"),
    iban: text("iban"),
    logoUrl: text("logo_url"),
    tradeType: text("trade_type"),
    /** Automatic J+7 / J+30 invoice reminders — TRB-058. Per-invoice override lives on `invoices.reminder_override`. */
    invoiceReminderEnabled: boolean("invoice_reminder_enabled")
      .notNull()
      .default(true),
    /** Custom reminder copy with `{{client}} {{number}} {{amount}} {{days}} {{link}}` placeholders — null uses the built-in French default. TRB-060. */
    invoiceReminderTemplate: text("invoice_reminder_template"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("artisan_profiles_tenant_id_idx").on(table.tenantId),
  })
);

export type ArtisanProfile = typeof artisanProfiles.$inferSelect;
export type NewArtisanProfile = typeof artisanProfiles.$inferInsert;
