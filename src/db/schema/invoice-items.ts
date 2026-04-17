import { pgTable, uuid, text, numeric, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { invoices } from "./invoices";
import { tenants } from "./tenants";

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 })
      .notNull()
      .default("21"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    tenantIdIdx: index("invoice_items_tenant_id_idx").on(table.tenantId),
  })
);

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  tenant: one(tenants, {
    fields: [invoiceItems.tenantId],
    references: [tenants.id],
  }),
}));

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
