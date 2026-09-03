/**
 * src/db/seed.ts
 * Local dev seed data. Run with: pnpm db:seed
 *
 * Creates one demo tenant + artisan profile + a couple of clients. Auth users
 * are created through Better Auth (sign up at /auth/signup), not here — this
 * only seeds tenant-scoped business data for an existing tenant, or a
 * standalone demo tenant with no login.
 */

import "dotenv/config";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required to seed");

const client = postgres(url, { prepare: false, max: 1, onnotice: () => {} });
const db = drizzle(client, { schema });

async function main() {
  const slug = "demo-artisan";

  let tenant = await db.query.tenants.findFirst({
    where: eq(schema.tenants.slug, slug),
    columns: { id: true },
  });

  if (!tenant) {
    [tenant] = await db
      .insert(schema.tenants)
      .values({ slug, plan: "pro" })
      .returning({ id: schema.tenants.id });
    console.log(`✓ tenant ${slug} (${tenant.id})`);
  } else {
    console.log(`• tenant ${slug} already exists (${tenant.id})`);
  }

  const tenantId = tenant.id;

  const existingProfile = await db.query.artisanProfiles.findFirst({
    where: eq(schema.artisanProfiles.tenantId, tenantId),
    columns: { id: true },
  });

  if (!existingProfile) {
    await db.insert(schema.artisanProfiles).values({
      tenantId,
      businessName: "Plomberie Démo",
      ownerName: "Jean Démo",
      email: "contact@plomberie-demo.fr",
      phone: "+33123456789",
      address: "1 rue de la Démo, 75001 Paris",
      vatNumber: "FR00123456789",
      tradeType: "plombier",
    });
    console.log("✓ artisan profile");
  }

  const clientCount = (
    await db.query.clients.findMany({
      where: eq(schema.clients.tenantId, tenantId),
      columns: { id: true },
    })
  ).length;

  if (clientCount === 0) {
    await db.insert(schema.clients).values([
      { tenantId, name: "Marie Client", email: "marie@example.fr", phone: "+33600000001" },
      { tenantId, name: "Paul Client", email: "paul@example.fr", phone: "+33600000002" },
    ]);
    console.log("✓ 2 clients");
  }

  console.log("\n✨ Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
