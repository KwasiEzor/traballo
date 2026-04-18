/**
 * New invoice page
 */

import { requireAuth } from "@/lib/auth";
import { createTenantClient } from "@/lib/db/tenant";
import { InvoiceForm } from "../components/invoice-form";

export default async function NewInvoicePage() {
  const { tenantId } = await requireAuth();

  // Fetch clients for dropdown
  const tenantDb = createTenantClient(tenantId);
  const clients = await tenantDb.query.clients.findMany({
    orderBy: (clients, { asc }) => [asc(clients.name)],
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Nouvelle facture</h1>
      <div className="rounded-lg border bg-white p-6">
        <InvoiceForm clients={clients} />
      </div>
    </div>
  );
}
