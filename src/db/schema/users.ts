import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenants";
import { user as authUser } from "./auth";

/**
 * Users table — tenant membership.
 *
 * Auth identity lives in Better Auth's `user` table (see auth.ts).
 * `users.id === user.id`. One user belongs to exactly one tenant
 * (artisan owner or employee).
 */
export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .references(() => authUser.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    email: text("email").notNull().unique(),
    role: text("role", { enum: ["owner", "employee"] })
      .notNull()
      .default("owner"),
    fullName: text("full_name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("users_tenant_id_idx").on(table.tenantId),
    emailIdx: index("users_email_idx").on(table.email),
  })
);

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  authUser: one(authUser, {
    fields: [users.id],
    references: [authUser.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
