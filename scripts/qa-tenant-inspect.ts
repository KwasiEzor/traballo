/**
 * scripts/qa-tenant-inspect.ts
 * READ-ONLY. Lists every tenant with its users, site slug/publish state and
 * row counts of child data, so we can decide which are QA throwaways.
 *
 * Run: npx tsx --env-file=.env.local scripts/qa-tenant-inspect.ts
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!, {
  prepare: false,
  onnotice: () => {},
});

async function main() {
  const rows = await sql/*sql*/ `
    select
      t.id, t.slug, t.plan, t.created_at,
      coalesce(json_agg(distinct u.email) filter (where u.email is not null), '[]') as user_emails,
      s.custom_domain, s.is_published, s.updated_at as site_updated,
      (select count(*) from clients c where c.tenant_id = t.id) as clients,
      (select count(*) from invoices i where i.tenant_id = t.id) as invoices,
      (select count(*) from appointments a where a.tenant_id = t.id) as appts,
      (select count(*) from ai_conversations ac where ac.tenant_id = t.id) as ai_convos
    from tenants t
    left join users u on u.tenant_id = t.id
    left join sites s on s.tenant_id = t.id
    group by t.id, t.slug, t.plan, t.created_at, s.custom_domain, s.is_published, s.updated_at
    order by t.created_at
  `;
  for (const r of rows) {
    console.log(
      [
        r.slug.padEnd(24),
        String(r.plan).padEnd(8),
        `pub=${r.is_published ?? "-"}`.padEnd(9),
        `clients=${r.clients}`.padEnd(11),
        `inv=${r.invoices}`.padEnd(7),
        `appt=${r.appts}`.padEnd(8),
        `ai=${r.ai_convos}`.padEnd(6),
        new Date(r.created_at).toISOString().slice(0, 10),
        JSON.stringify(r.user_emails),
      ].join("  ")
    );
  }
  console.log(`\n${rows.length} tenants total`);

  // orphan auth users (no app users row → no tenant)
  const orphans = await sql/*sql*/ `
    select au.email, au.email_verified, au.created_at
    from "user" au
    left join users u on u.id = au.id
    where u.id is null
    order by au.created_at
  `;
  console.log(`\nAuth users with NO tenant membership (${orphans.length}):`);
  for (const o of orphans) {
    console.log(`  ${o.email}  verified=${o.email_verified}  ${new Date(o.created_at).toISOString().slice(0, 10)}`);
  }
}

main()
  .then(() => sql.end())
  .catch((e) => {
    console.error(e);
    return sql.end().then(() => process.exit(1));
  });
