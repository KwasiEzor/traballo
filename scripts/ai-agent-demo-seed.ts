/**
 * scripts/ai-agent-demo-seed.ts
 * Ensure the `menuiserie-demo` tenant has an enabled AI agent config so the
 * website chat widget can be demoed / QA'd. Idempotent.
 *
 * Run: npx tsx --env-file=.env.local scripts/ai-agent-demo-seed.ts
 */
import postgres from "postgres";

const sql = postgres(
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  { prepare: false, onnotice: () => {} }
);

async function main() {
  const [tenant] = await sql/*sql*/ `
    select t.id, p.business_name, p.owner_name
    from tenants t
    join artisan_profiles p on p.tenant_id = t.id
    where t.slug = 'menuiserie-demo'
  `;
  if (!tenant) {
    console.log("menuiserie-demo not found — nothing to seed.");
    return;
  }

  const context =
    "Atelier de menuiserie artisanale. Fabrication sur mesure (meubles, placards, escaliers), pose de parquet et de terrasses bois, restauration de menuiseries anciennes. Déplacement pour devis gratuit dans un rayon de 30 km. Délais courants : 3 à 6 semaines selon la pièce.";

  const existing = await sql/*sql*/ `
    select id from ai_agent_config where tenant_id = ${tenant.id}
  `;

  if (existing.length) {
    await sql/*sql*/ `
      update ai_agent_config
      set is_enabled = true,
          agent_name = 'Camille',
          tone = 'warm',
          business_context = ${context},
          opening_message = ${"Bonjour, je suis Camille, l'assistante de " + tenant.business_name + ". Un projet de menuiserie ? Dites-moi tout."},
          updated_at = now()
      where tenant_id = ${tenant.id}
    `;
    console.log("Updated ai_agent_config for menuiserie-demo.");
  } else {
    await sql/*sql*/ `
      insert into ai_agent_config
        (tenant_id, agent_name, is_enabled, tone, languages, business_context, opening_message)
      values
        (${tenant.id}, 'Camille', true, 'warm', ${sql.json(["fr"])}, ${context},
         ${"Bonjour, je suis Camille, l'assistante de " + tenant.business_name + ". Un projet de menuiserie ? Dites-moi tout."})
    `;
    console.log("Inserted ai_agent_config for menuiserie-demo.");
  }
}

main()
  .then(() => sql.end())
  .catch((e) => {
    console.error(e);
    return sql.end().then(() => process.exit(1));
  });
