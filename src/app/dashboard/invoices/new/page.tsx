import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { clients as clientsTable } from "@/db/schema";
import { PageHeader } from "@/components/dashboard/page-header";
import { InvoiceForm } from "../invoice-form";

export const metadata: Metadata = { title: "Nouvelle facture" };
export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client } = await searchParams;
  const { tenantId } = await requireAuth();
  const clients = await withTenant(tenantId, (tx) =>
    tx.query.clients.findMany({
      where: eq(clientsTable.tenantId, tenantId),
      orderBy: (c, { asc }) => [asc(c.name)],
      columns: { id: true, name: true },
    })
  );

  return (
    <>
      <PageHeader
        title="Nouvelle facture"
        breadcrumb={[
          { label: "Factures", href: "/dashboard/invoices" },
          { label: "Nouvelle" },
        ]}
      />
      <InvoiceForm clients={clients} defaultClientId={client} />
    </>
  );
}
