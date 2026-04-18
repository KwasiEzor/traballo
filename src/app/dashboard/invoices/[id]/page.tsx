/**
 * Invoice detail page
 */

import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createTenantClient } from "@/lib/db/tenant";
import { InvoiceActions } from "../components/invoice-actions";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { tenantId } = await requireAuth();
  const { id } = await params;

  const tenantDb = createTenantClient(tenantId);
  const invoice = await tenantDb.query.invoices.findFirst({
    where: (invoices, { eq }) => eq(invoices.id, id),
    with: {
      client: true,
      items: true,
    },
  });

  if (!invoice) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/invoices"
            className="mb-2 text-sm text-blue-600 hover:underline"
          >
            ← Retour aux factures
          </Link>
          <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
        </div>
        <InvoiceActions invoice={invoice} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice header */}
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-600">Client</div>
                <div className="text-lg font-medium">{invoice.client.name}</div>
                {invoice.client.email && (
                  <div className="text-sm text-gray-600">
                    {invoice.client.email}
                  </div>
                )}
                {invoice.client.phone && (
                  <div className="text-sm text-gray-600">
                    {invoice.client.phone}
                  </div>
                )}
              </div>
              <StatusBadge status={invoice.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Date d'émission:</span>
                <span className="ml-2 font-medium">
                  {new Date(invoice.issueDate).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Date d'échéance:</span>
                <span className="ml-2 font-medium">
                  {new Date(invoice.dueDate).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="rounded-lg border bg-white">
            <div className="border-b p-4">
              <h2 className="font-semibold">Articles</h2>
            </div>
            <table className="w-full">
              <thead className="border-b bg-gray-50 text-sm">
                <tr>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-right">Qté</th>
                  <th className="px-4 py-2 text-right">Prix HT</th>
                  <th className="px-4 py-2 text-right">TVA</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">{item.unitPrice}€</td>
                    <td className="px-4 py-3 text-right">{item.taxRate}%</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {item.total}€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="rounded-lg border bg-white p-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total HT</span>
                <span className="font-medium">{invoice.subtotal}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TVA</span>
                <span className="font-medium">{invoice.taxAmount}€</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg">
                <span className="font-semibold">Total TTC</span>
                <span className="font-bold">{invoice.total}€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 font-semibold">Informations</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600">Créée le</div>
                <div>
                  {new Date(invoice.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
              {invoice.sentAt && (
                <div>
                  <div className="text-gray-600">Envoyée le</div>
                  <div>
                    {new Date(invoice.sentAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              )}
              {invoice.paidAt && (
                <div>
                  <div className="text-gray-600">Payée le</div>
                  <div>
                    {new Date(invoice.paidAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              )}
              {invoice.pdfUrl && (
                <div>
                  <a
                    href={invoice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    📄 Télécharger PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
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

  const labels = {
    draft: "Brouillon",
    sent: "Envoyée",
    viewed: "Vue",
    paid: "Payée",
    overdue: "En retard",
    cancelled: "Annulée",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        styles[status as keyof typeof styles] || styles.draft
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
