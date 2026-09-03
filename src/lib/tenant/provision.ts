/**
 * src/lib/tenant/provision.ts
 * Idempotent tenant provisioning for a newly-created auth user.
 *
 * Runs as a Better Auth `databaseHooks.user.create.after` hook, so it covers
 * both email/password signup and OAuth (Google) first sign-in.
 */

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants, users } from "@/db/schema";

function slugifyBusinessName(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "artisan";
}

async function buildUniqueTenantSlug(businessName: string) {
  const baseSlug = slugifyBusinessName(businessName);

  for (let suffix = 0; suffix < 100; suffix += 1) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    const existing = await db.query.tenants.findFirst({
      where: eq(tenants.slug, candidate),
      columns: { id: true },
    });
    if (!existing) return candidate;
  }

  throw new Error("Could not allocate a unique tenant slug");
}

export interface ProvisionableUser {
  id: string;
  email: string;
  name?: string | null;
}

/**
 * Ensure the given auth user has a tenant + `users` membership row.
 * No-op if the membership already exists.
 */
export async function ensureTenantForUser(user: ProvisionableUser): Promise<void> {
  const existing = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: { id: true },
  });
  if (existing) return;

  const businessName = user.name?.trim() || user.email.split("@")[0] || "Mon entreprise";
  const slug = await buildUniqueTenantSlug(businessName);

  await db.transaction(async (tx) => {
    const [tenant] = await tx
      .insert(tenants)
      .values({ slug, plan: "free" })
      .returning({ id: tenants.id });

    await tx.insert(users).values({
      id: user.id,
      tenantId: tenant.id,
      email: user.email,
      fullName: businessName,
      role: "owner",
    });
  });
}
