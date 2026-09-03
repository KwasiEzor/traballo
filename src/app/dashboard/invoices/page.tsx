import Link from "next/link";
import { Plus, ReceiptText } from "lucide-react";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { invoices as invoicesTable } from "@/db/schema";
import { formatEUR, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InvoiceStatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const { tenantId } = await requireAuth();
  const invoices = await withTenant(tenantId, (tx) =>
    tx.query.invoices.findMany({
      where: eq(invoicesTable.tenantId, tenantId),
      orderBy: (i, { desc }) => [desc(i.createdAt)],
      with: { client: { columns: { name: true } } },
    })
  );

  const paid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.total), 0);
  const outstanding = invoices
    .filter((i) => ["sent", "viewed", "overdue"].includes(i.status))
    .reduce((s, i) => s + Number(i.total), 0);

  return (
    <>
      <PageHeader
        title="Factures"
        description={`${invoices.length} facture${invoices.length > 1 ? "s" : ""}`}
        actions={
          <Button asChild>
            <Link href="/dashboard/invoices/new">
              <Plus className="size-4" /> Nouvelle facture
            </Link>
          </Button>
        }
      />

      {invoices.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="Aucune facture"
          description="Créez votre première facture. Elle sera générée au format conforme."
          action={
            <Button asChild>
              <Link href="/dashboard/invoices/new">Nouvelle facture</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <StatCard label="Encaissé (total)" value={formatEUR(paid)} />
            <StatCard label="En attente de paiement" value={formatEUR(outstanding)} />
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden sm:table-cell">Émise le</TableHead>
                  <TableHead className="hidden md:table-cell">Échéance</TableHead>
                  <TableHead className="text-right">Montant TTC</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inv.client?.name ?? "—"}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {formatDate(inv.issueDate, { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {formatDate(inv.dueDate, { day: "numeric", month: "short" })}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums text-foreground">
                      {formatEUR(inv.total)}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={inv.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </>
  );
}
