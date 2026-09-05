/**
 * scripts/qa-tenant-purge.ts
 * One-shot cleanup: delete the QA throwaway tenants created during the
 * signup→publish walkthroughs (Sept 2026) and their Better Auth users.
 *
 * Deleting a tenant row cascades to sites / clients / invoices / invoice_items
 * / appointments / availability / ai_* / users. Deleting the auth `user` row
 * cascades to session / account. `verification` rows are keyed by email string
 * (no FK) so they are cleared explicitly.
 *
 * Kept on purpose: impactore-business, menuiserie-demo.
 *
 * Run: npx tsx --env-file=.env.local scripts/qa-tenant-purge.ts
 */
import postgres from "postgres";

const QA_SLUGS = [
  "qa-plomberie-test",
  "electricite-moreau",
  "plomberie-test-email",
  "menuiserie-test-mail",
  "peinture-recap-test",
];

const sql = postgres(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!, {
  prepare: false,
  onnotice: () => {},
});

async function main() {
  const targets = await sql/*sql*/ `
    select t.id, t.slug, coalesce(array_agg(u.id) filter (where u.id is not null), '{}') as user_ids,
           coalesce(array_agg(u.email) filter (where u.email is not null), '{}') as emails
    from tenants t
    left join users u on u.tenant_id = t.id
    where t.slug = any(${sql.array(QA_SLUGS)})
    group by t.id, t.slug
  `;

  if (targets.length === 0) {
    console.log("Nothing to delete — no matching slugs.");
    return;
  }

  const guard = targets.map((t) => t.slug).filter((s) => !QA_SLUGS.includes(s));
  if (guard.length) throw new Error(`Refusing: unexpected slug in target set: ${guard.join(", ")}`);

  console.log("Deleting:");
  for (const t of targets) console.log(`  ${t.slug}  users=${JSON.stringify(t.emails)}`);

  await sql.begin(async (tx) => {
    for (const t of targets) {
      const emails: string[] = t.emails;
      const userIds: string[] = t.user_ids;

      await tx/*sql*/ `delete from tenants where id = ${t.id}`;

      if (userIds.length) {
        await tx/*sql*/ `delete from "user" where id = any(${tx.array(userIds)})`;
      }
      if (emails.length) {
        await tx/*sql*/ `delete from verification where identifier = any(${tx.array(emails)})`;
      }
    }
  });

  console.log(`\nDone — ${targets.length} tenants purged.`);

  const remaining = await sql/*sql*/ `select slug from tenants order by created_at`;
  console.log("Remaining tenants:", remaining.map((r) => r.slug).join(", "));
}

main()
  .then(() => sql.end())
  .catch((e) => {
    console.error(e);
    return sql.end().then(() => process.exit(1));
  });
