import Link from "next/link";
import {
  Wallet,
  Clock,
  CalendarClock,
  Users,
  Plus,
  ArrowRight,
  ReceiptText,
  CalendarDays,
} from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { getArtisanProfile } from "@/lib/artisan/profile";
import { getDashboardSummary } from "@/lib/dashboard/queries";
import { UpgradeCard } from "@/components/dashboard/upgrade-cta";
import { formatEUR, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  InvoiceStatusBadge,
  AppointmentStatusBadge,
} from "@/components/dashboard/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertContent, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const [{ plan }, profile, summary] = await Promise.all([
    requireAuth(),
    getArtisanProfile(),
    getDashboardSummary(),
  ]);
  const firstName = (profile?.ownerName ?? "").split(" ")[0] || null;

  return (
    <>
      <PageHeader
        title={firstName ? `Bonjour, ${firstName}` : "Tableau de bord"}
        description="Voici l'essentiel de votre activité."
        actions={
          <Button asChild>
            <Link href="/dashboard/invoices/new">
              <Plus className="size-4" /> Nouvelle facture
            </Link>
          </Button>
        }
      />

      {welcome && (
        <Alert variant="success" className="mb-6">
          <AlertContent>
            <AlertTitle>Votre compte est prêt.</AlertTitle>
            <AlertDescription>
              Prochaine étape : personnalisez votre{" "}
              <Link href="/dashboard/site" className="font-medium underline">
                site public
              </Link>{" "}
              ou créez votre première facture.
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <UpgradeCard plan={plan} className="mb-6" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Encaissé ce mois"
          value={formatEUR(summary.paidThisMonth)}
          icon={Wallet}
          hint="factures payées"
        />
        <StatCard
          label="En attente de paiement"
          value={formatEUR(summary.outstanding)}
          icon={Clock}
          hint={`${summary.outstandingCount} facture${summary.outstandingCount > 1 ? "s" : ""}`}
        />
        <StatCard
          label="Rendez-vous à venir"
          value={summary.upcomingAppointments}
          icon={CalendarClock}
          hint={
            summary.pendingAppointments > 0
              ? `${summary.pendingAppointments} à confirmer`
              : "aucun en attente"
          }
        />
        <StatCard
          label="Clients"
          value={summary.clientCount}
          icon={Users}
          hint="au carnet"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Dernières factures</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/invoices">
                Tout voir <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {summary.recentInvoices.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="Aucune facture"
                description="Créez votre première facture pour la retrouver ici."
                action={
                  <Button asChild size="sm">
                    <Link href="/dashboard/invoices/new">Nouvelle facture</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {summary.recentInvoices.map((inv) => (
                  <li key={inv.id}>
                    <Link
                      href={`/dashboard/invoices/${inv.id}`}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          {inv.invoiceNumber}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {inv.clientName ?? "Client supprimé"} ·{" "}
                          {formatDate(inv.issueDate, { day: "numeric", month: "short" })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium tabular-nums text-foreground">
                          {formatEUR(inv.total)}
                        </span>
                        <InvoiceStatusBadge status={inv.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Prochains rendez-vous</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/appointments">
                Tout voir <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {summary.nextAppointments.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Aucun rendez-vous"
                description="Vos rendez-vous à venir apparaîtront ici."
                action={
                  <Button asChild size="sm">
                    <Link href="/dashboard/appointments/new">Planifier</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {summary.nextAppointments.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/dashboard/appointments/${a.id}`}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          {a.title}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {a.clientName ? `${a.clientName} · ` : ""}
                          {formatDate(a.startTime, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <AppointmentStatusBadge status={a.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/dashboard/invoices/new", label: "Créer une facture", icon: ReceiptText },
            { href: "/dashboard/clients/new", label: "Ajouter un client", icon: Users },
            { href: "/dashboard/appointments/new", label: "Planifier un RDV", icon: CalendarDays },
            { href: "/dashboard/site", label: "Modifier mon site", icon: ArrowRight },
          ].map((q) => (
            <Button key={q.href} asChild variant="outline" className="h-auto justify-start py-3">
              <Link href={q.href}>
                <q.icon className="size-4 text-primary" />
                {q.label}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

// dashboard home reads live data
export const dynamic = "force-dynamic";
