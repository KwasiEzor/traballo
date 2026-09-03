import { notFound } from "next/navigation";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { FileCheck2 } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { invoices as invoicesTable } from "@/db/schema";
import { formatEUR, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { InvoiceStatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InvoiceActions } from "../invoice-actions";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { tenantId } = await requireAuth();

  const invoice = await withTenant(tenantId, (tx) =>
    tx.query.invoices.findFirst({
      where: and(eq(invoicesTable.id, id), eq(invoicesTable.tenantId, tenantId)),
      with: { client: true, items: true },
    })
  );
  if (!invoice) notFound();

  return (
    <>
      <PageHeader
        title={invoice.invoiceNumber}
        breadcrumb={[
          { label: "Factures", href: "/dashboard/invoices" },
          { label: invoice.invoiceNumber },
        ]}
        actions={
          <InvoiceActions
            invoice={{
              id: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              status: invoice.status,
              client: { name: invoice.client.name, email: invoice.client.email },
            }}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Facturé à
                </div>
                <div className="mt-1 text-base font-medium text-foreground">
                  {invoice.client.name}
                </div>
                {invoice.client.address && (
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {invoice.client.address}
                  </div>
                )}
                {invoice.client.email && (
                  <div className="text-sm text-muted-foreground">
                    {invoice.client.email}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <InvoiceStatusBadge status={invoice.status} />
                <Badge variant="success">
                  <FileCheck2 className="size-3" /> Factur-X prêt
                </Badge>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <div className="text-muted-foreground">Émise le</div>
                <div className="font-medium text-foreground">
                  {formatDate(invoice.issueDate)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Échéance</div>
                <div className="font-medium text-foreground">
                  {formatDate(invoice.dueDate)}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 text-left font-medium">Description</th>
                    <th className="pb-2 text-right font-medium">Qté</th>
                    <th className="pb-2 text-right font-medium">P.U. HT</th>
                    <th className="pb-2 text-right font-medium">TVA</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((it) => (
                    <tr key={it.id} className="border-b border-border/60">
                      <td className="py-3 text-foreground">{it.description}</td>
                      <td className="py-3 text-right tabular-nums text-muted-foreground">
                        {it.quantity}
                      </td>
                      <td className="py-3 text-right tabular-nums text-muted-foreground">
                        {formatEUR(it.unitPrice)}
                      </td>
                      <td className="py-3 text-right tabular-nums text-muted-foreground">
                        {it.taxRate} %
                      </td>
                      <td className="py-3 text-right tabular-nums font-medium text-foreground">
                        {formatEUR(it.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 ml-auto w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Total HT</span>
                <span className="tabular-nums">{formatEUR(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>TVA</span>
                <span className="tabular-nums">{formatEUR(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 font-display text-base font-semibold text-foreground">
                <span>Total TTC</span>
                <span className="tabular-nums">{formatEUR(invoice.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6 text-sm">
            <Row label="Créée le" value={formatDate(invoice.createdAt)} />
            {invoice.sentAt && (
              <Row label="Envoyée le" value={formatDate(invoice.sentAt)} />
            )}
            {invoice.paidAt && (
              <Row label="Payée le" value={formatDate(invoice.paidAt)} />
            )}
            <Separator />
            <div>
              <div className="text-muted-foreground">Client</div>
              <Link
                href={`/dashboard/clients/${invoice.clientId}`}
                className="font-medium text-primary hover:underline"
              >
                Voir la fiche
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
