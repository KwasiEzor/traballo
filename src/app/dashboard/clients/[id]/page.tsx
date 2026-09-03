import { notFound } from "next/navigation";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { Mail, Phone, MapPin, Plus, ReceiptText, CalendarDays } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { clients as clientsTable } from "@/db/schema";
import { formatEUR, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { InvoiceStatusBadge, AppointmentStatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ClientDangerZone } from "./client-danger-zone";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { tenantId } = await requireAuth();

  const client = await withTenant(tenantId, (tx) =>
    tx.query.clients.findFirst({
      where: and(eq(clientsTable.id, id), eq(clientsTable.tenantId, tenantId)),
      with: {
        invoices: {
          orderBy: (i, { desc }) => [desc(i.createdAt)],
          limit: 8,
        },
        appointments: {
          orderBy: (a, { desc }) => [desc(a.startTime)],
          limit: 8,
        },
      },
    })
  );

  if (!client) notFound();

  return (
    <>
      <PageHeader
        title={client.name}
        breadcrumb={[
          { label: "Clients", href: "/dashboard/clients" },
          { label: client.name },
        ]}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/dashboard/clients/${client.id}/edit`}>Modifier</Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/invoices/new?client=${client.id}`}>
                <Plus className="size-4" /> Facture
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-2.5 text-foreground hover:text-primary"
                >
                  <Mail className="size-4 text-muted-foreground" /> {client.email}
                </a>
              )}
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-2.5 text-foreground hover:text-primary"
                >
                  <Phone className="size-4 text-muted-foreground" /> {client.phone}
                </a>
              )}
              {client.address && (
                <div className="flex items-start gap-2.5 text-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="whitespace-pre-line">{client.address}</span>
                </div>
              )}
              {!client.email && !client.phone && !client.address && (
                <p className="text-muted-foreground">Aucune coordonnée renseignée.</p>
              )}
              <Separator />
              <p className="text-xs text-muted-foreground">
                Client depuis le {formatDate(client.createdAt)}
              </p>
            </CardContent>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {client.notes}
                </p>
              </CardContent>
            </Card>
          )}

          <ClientDangerZone clientId={client.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Factures</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dashboard/invoices/new?client=${client.id}`}>
                  <Plus className="size-4" /> Nouvelle
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.invoices.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucune facture pour ce client.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {client.invoices.map((inv) => (
                    <li key={inv.id}>
                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-muted"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <ReceiptText className="size-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDate(inv.issueDate, { day: "numeric", month: "short" })}
                          </span>
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="text-sm font-medium tabular-nums text-foreground">
                            {formatEUR(inv.total)}
                          </span>
                          <InvoiceStatusBadge status={inv.status} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Rendez-vous</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dashboard/appointments/new?client=${client.id}`}>
                  <Plus className="size-4" /> Nouveau
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.appointments.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucun rendez-vous.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {client.appointments.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/dashboard/appointments/${a.id}`}
                        className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-muted"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <CalendarDays className="size-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{a.title}</span>
                          <span className="text-muted-foreground">
                            {formatDate(a.startTime, {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </span>
                        <AppointmentStatusBadge status={a.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
