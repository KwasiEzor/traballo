/**
 * Invoices page
 */

import { requireAuth } from "@/lib/auth";
import { getTenantId } from "@/lib/auth/tenant";
import { getTenantDb } from "@/lib/db/tenant";
import Link from "next/link";

export default async function InvoicesPage() {
  await requireAuth();
  const tenantId = await getTenantId();

  if (!tenantId) {
    return <div>Tenant not found</div>;
  }

  const tenantDb = getTenantDb(tenantId);
  const invoices = await tenantDb.query.invoices.findMany({
    with: {
      client: true,
    },
    orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Factures</h1>
        <Link
          href="/dashboard/invoices/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Nouvelle facture
        </Link>
      </div>

      <div className="rounded-lg border bg-white">
        {invoices.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            Aucune facture. Créez votre première facture.
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  N° Facture
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{invoice.client?.name}</td>
                  <td className="px-6 py-4">
                    {new Date(invoice.issueDate).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4">{invoice.total}€</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={invoice.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    viewed: "bg-purple-100 text-purple-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        styles[status as keyof typeof styles] || styles.draft
      }`}
    >
      {status}
    </span>
  );
}
