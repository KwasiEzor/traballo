// @vitest-environment node

/**
 * tests/security/tenant-isolation.test.ts
 *
 * Real RLS security tests against the configured Postgres database.
 * Each test seeds fixtures inside a transaction and rolls them back.
 *
 * Run explicitly with:
 * `pnpm test:security`
 */

import { randomUUID } from "node:crypto";
import dotenv from "dotenv";
import postgres, { type Sql, type TransactionSql } from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

dotenv.config({ path: ".env.local" });

type DbSql = Sql<Record<string, never>>;
type DbTransaction = TransactionSql<Record<string, never>>;

interface Fixtures {
  tenantA: { id: string; slug: string };
  tenantB: { id: string; slug: string };
  clientA: { id: string };
  clientB: { id: string };
  invoiceA: { id: string };
  invoiceB: { id: string };
  invoiceItemA: { id: string };
  invoiceItemB: { id: string };
  appointmentA: { id: string };
  appointmentB: { id: string };
  conversationA: { id: string };
  conversationB: { id: string };
  messageA: { id: string };
  messageB: { id: string };
}

const rollbackMarker = Symbol("tenant-security-rollback");
const shouldRunSecurityTests =
  process.env.RUN_DB_SECURITY_TESTS === "1" && Boolean(process.env.DIRECT_URL);
const describeSecurity = shouldRunSecurityTests ? describe : describe.skip;

let sqlClient: DbSql | null = null;

beforeAll(() => {
  if (!shouldRunSecurityTests) {
    return;
  }

  sqlClient = postgres(process.env.DIRECT_URL!, {
    prepare: false,
    max: 1,
    idle_timeout: 1,
  }) as DbSql;
});

afterAll(async () => {
  if (!sqlClient) {
    return;
  }

  await sqlClient.end();
});

describeSecurity("@integration Isolation multi-tenant RLS", () => {
  it("tenant A cannot read, update, or delete invoices owned by tenant B", async () => {
    await withSeededFixtures(async (tx, fixtures) => {
      await asAuthenticatedTenant(tx, fixtures.tenantA.id, async () => {
        const visible = await tx<{ id: string }[]>`
          select id
          from public.invoices
          where id = ${fixtures.invoiceB.id}
        `;

        const updated = await tx<{ id: string }[]>`
          update public.invoices
          set status = 'paid'
          where id = ${fixtures.invoiceB.id}
          returning id
        `;

        const deleted = await tx<{ id: string }[]>`
          delete from public.invoices
          where id = ${fixtures.invoiceB.id}
          returning id
        `;

        expect(visible).toHaveLength(0);
        expect(updated).toHaveLength(0);
        expect(deleted).toHaveLength(0);
      });

      const [persisted] = await tx<{ status: string }[]>`
        select status
        from public.invoices
        where id = ${fixtures.invoiceB.id}
      `;

      expect(persisted.status).toBe("draft");
    });
  });

  it("tenant A cannot read or update clients owned by tenant B", async () => {
    await withSeededFixtures(async (tx, fixtures) => {
      await asAuthenticatedTenant(tx, fixtures.tenantA.id, async () => {
        const visible = await tx<{ id: string }[]>`
          select id
          from public.clients
          where id = ${fixtures.clientB.id}
        `;

        const updated = await tx<{ id: string }[]>`
          update public.clients
          set notes = 'tampered'
          where id = ${fixtures.clientB.id}
          returning id
        `;

        expect(visible).toHaveLength(0);
        expect(updated).toHaveLength(0);
      });
    });
  });

  it("tenant A cannot read appointments owned by tenant B", async () => {
    await withSeededFixtures(async (tx, fixtures) => {
      await asAuthenticatedTenant(tx, fixtures.tenantA.id, async () => {
        const rows = await tx<{ id: string }[]>`
          select id
          from public.appointments
          where id = ${fixtures.appointmentB.id}
        `;

        expect(rows).toHaveLength(0);
      });
    });
  });

  it("tenant A cannot read AI conversations owned by tenant B", async () => {
    await withSeededFixtures(async (tx, fixtures) => {
      await asAuthenticatedTenant(tx, fixtures.tenantA.id, async () => {
        const rows = await tx<{ id: string }[]>`
          select id
          from public.ai_conversations
          where id = ${fixtures.conversationB.id}
        `;

        expect(rows).toHaveLength(0);
      });
    });
  });

  it("tenant A cannot read invoice items owned by tenant B", async () => {
    await withSeededFixtures(async (tx, fixtures) => {
      await asAuthenticatedTenant(tx, fixtures.tenantA.id, async () => {
        const rows = await tx<{ id: string }[]>`
          select id
          from public.invoice_items
          where id = ${fixtures.invoiceItemB.id}
        `;

        expect(rows).toHaveLength(0);
      });
    });
  });

  it("tenant A cannot read AI messages owned by tenant B", async () => {
    await withSeededFixtures(async (tx, fixtures) => {
      await asAuthenticatedTenant(tx, fixtures.tenantA.id, async () => {
        const rows = await tx<{ id: string }[]>`
          select id
          from public.ai_messages
          where id = ${fixtures.messageB.id}
        `;

        expect(rows).toHaveLength(0);
      });
    });
  });

  it("service_role can still read cross-tenant data for backend jobs", async () => {
    await withSeededFixtures(async (tx, fixtures) => {
      await asServiceRole(tx, async () => {
        const invoices = await tx<{ id: string }[]>`
          select id
          from public.invoices
          where id = ${fixtures.invoiceA.id} or id = ${fixtures.invoiceB.id}
          order by id
        `;

        const conversations = await tx<{ id: string }[]>`
          select id
          from public.ai_conversations
          where id = ${fixtures.conversationA.id} or id = ${fixtures.conversationB.id}
          order by id
        `;

        expect(invoices.map((row) => row.id)).toEqual(
          [fixtures.invoiceA.id, fixtures.invoiceB.id].sort()
        );
        expect(conversations.map((row) => row.id)).toEqual(
          [fixtures.conversationA.id, fixtures.conversationB.id].sort()
        );
      });
    });
  });
});

async function withSeededFixtures(
  run: (tx: DbTransaction, fixtures: Fixtures) => Promise<void>
) {
  const client = getSqlClient();

  try {
    await client.begin(async (tx) => {
      const typedTx = tx as DbTransaction;
      const fixtures = await seedFixtures(typedTx);
      await run(typedTx, fixtures);
      throw rollbackMarker;
    });
  } catch (error) {
    if (error !== rollbackMarker) {
      throw error;
    }
  }
}

async function asAuthenticatedTenant(
  tx: DbTransaction,
  tenantId: string,
  run: () => Promise<void>
) {
  await tx`set local role authenticated`;
  await tx`select set_config('app.current_tenant_id', ${tenantId}, true)`;

  try {
    await run();
  } finally {
    await tx`select set_config('app.current_tenant_id', '', true)`;
    await tx`reset role`;
  }
}

async function asServiceRole(tx: DbTransaction, run: () => Promise<void>) {
  await tx`set local role service_role`;

  try {
    await run();
  } finally {
    await tx`reset role`;
  }
}

async function seedFixtures(tx: DbTransaction): Promise<Fixtures> {
  const nonce = randomUUID().slice(0, 8);
  const clientAEmail = `client-a-${nonce}@example.test`;
  const clientBEmail = `client-b-${nonce}@example.test`;
  const invoiceANumber = `INV-A-${nonce}`;
  const invoiceBNumber = `INV-B-${nonce}`;
  const visitorA = `visitor-a-${nonce}`;
  const visitorB = `visitor-b-${nonce}`;
  const tenantA = {
    id: randomUUID(),
    slug: `security-a-${nonce}`,
  };
  const tenantB = {
    id: randomUUID(),
    slug: `security-b-${nonce}`,
  };
  const clientA = { id: randomUUID() };
  const clientB = { id: randomUUID() };
  const invoiceA = { id: randomUUID() };
  const invoiceB = { id: randomUUID() };
  const invoiceItemA = { id: randomUUID() };
  const invoiceItemB = { id: randomUUID() };
  const appointmentA = { id: randomUUID() };
  const appointmentB = { id: randomUUID() };
  const conversationA = { id: randomUUID() };
  const conversationB = { id: randomUUID() };
  const messageA = { id: randomUUID() };
  const messageB = { id: randomUUID() };

  await tx`
    insert into public.tenants (id, slug, plan)
    values (${tenantA.id}, ${tenantA.slug}, 'pro')
  `;

  await tx`
    insert into public.clients (id, tenant_id, name, email)
    values (${clientA.id}, ${tenantA.id}, 'Client A', ${clientAEmail})
  `;

  await tx`
    insert into public.invoices (
      id,
      tenant_id,
      client_id,
      invoice_number,
      status,
      issue_date,
      due_date,
      subtotal,
      tax_amount,
      total
    )
    values (
      ${invoiceA.id},
      ${tenantA.id},
      ${clientA.id},
      ${invoiceANumber},
      'draft',
      '2026-04-18',
      '2026-05-18',
      100,
      21,
      121
    )
  `;

  await tx`
    insert into public.invoice_items (
      id,
      tenant_id,
      invoice_id,
      description,
      quantity,
      unit_price,
      tax_rate,
      total
    )
    values (${invoiceItemA.id}, ${tenantA.id}, ${invoiceA.id}, 'Item A', 1, 100, 21, 121)
  `;

  await tx`
    insert into public.appointments (
      id,
      tenant_id,
      client_id,
      title,
      start_time,
      end_time,
      status
    )
    values (
      ${appointmentA.id},
      ${tenantA.id},
      ${clientA.id},
      'Appointment A',
      '2026-04-18 09:00:00',
      '2026-04-18 10:00:00',
      'confirmed'
    )
  `;

  await tx`
    insert into public.ai_conversations (
      id,
      tenant_id,
      visitor_id,
      lead_name,
      channel
    )
    values (${conversationA.id}, ${tenantA.id}, ${visitorA}, 'Lead A', 'web')
  `;

  await tx`
    insert into public.ai_messages (
      id,
      tenant_id,
      conversation_id,
      role,
      content
    )
    values (${messageA.id}, ${tenantA.id}, ${conversationA.id}, 'user', 'Hello from tenant A')
  `;

  await tx`
    insert into public.tenants (id, slug, plan)
    values (${tenantB.id}, ${tenantB.slug}, 'pro')
  `;

  await tx`
    insert into public.clients (id, tenant_id, name, email)
    values (${clientB.id}, ${tenantB.id}, 'Client B', ${clientBEmail})
  `;

  await tx`
    insert into public.invoices (
      id,
      tenant_id,
      client_id,
      invoice_number,
      status,
      issue_date,
      due_date,
      subtotal,
      tax_amount,
      total
    )
    values (
      ${invoiceB.id},
      ${tenantB.id},
      ${clientB.id},
      ${invoiceBNumber},
      'draft',
      '2026-04-18',
      '2026-05-18',
      200,
      42,
      242
    )
  `;

  await tx`
    insert into public.invoice_items (
      id,
      tenant_id,
      invoice_id,
      description,
      quantity,
      unit_price,
      tax_rate,
      total
    )
    values (${invoiceItemB.id}, ${tenantB.id}, ${invoiceB.id}, 'Item B', 2, 100, 21, 242)
  `;

  await tx`
    insert into public.appointments (
      id,
      tenant_id,
      client_id,
      title,
      start_time,
      end_time,
      status
    )
    values (
      ${appointmentB.id},
      ${tenantB.id},
      ${clientB.id},
      'Appointment B',
      '2026-04-18 11:00:00',
      '2026-04-18 12:00:00',
      'confirmed'
    )
  `;

  await tx`
    insert into public.ai_conversations (
      id,
      tenant_id,
      visitor_id,
      lead_name,
      channel
    )
    values (${conversationB.id}, ${tenantB.id}, ${visitorB}, 'Lead B', 'web')
  `;

  await tx`
    insert into public.ai_messages (
      id,
      tenant_id,
      conversation_id,
      role,
      content
    )
    values (${messageB.id}, ${tenantB.id}, ${conversationB.id}, 'assistant', 'Hello from tenant B')
  `;

  return {
    tenantA,
    tenantB,
    clientA,
    clientB,
    invoiceA,
    invoiceB,
    invoiceItemA,
    invoiceItemB,
    appointmentA,
    appointmentB,
    conversationA,
    conversationB,
    messageA,
    messageB,
  };
}

function getSqlClient() {
  if (!sqlClient) {
    throw new Error(
      "Security test database client is not initialized. Run with RUN_DB_SECURITY_TESTS=1."
    );
  }

  return sqlClient;
}
