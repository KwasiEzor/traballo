import { pgTable, uuid, integer, time, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const availability = pgTable(
  "availability",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(), // 0=Monday, 6=Sunday
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
  },
  (table) => ({
    tenantIdIdx: index("availability_tenant_id_idx").on(table.tenantId),
  })
);

export type Availability = typeof availability.$inferSelect;
export type NewAvailability = typeof availability.$inferInsert;
