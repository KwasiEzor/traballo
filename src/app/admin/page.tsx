import Link from "next/link";
import {
  Building2,
  TrendingUp,
  UserPlus,
  Wallet,
  Rocket,
  Globe2,
  ReceiptText,
  CalendarClock,
  MessagesSquare,
  MoonStar,
} from "lucide-react";
import { requireAdminAccess } from "@/lib/auth/admin";
import { getAdminMetrics } from "@/lib/admin/metrics";
import { getAdminOverview } from "@/lib/admin/queries";
import { formatEUR, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { MiniBarChart } from "@/components/admin/mini-bar-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const PLAN_BADGE = {
  free: "neutral",
  pro: "default",
  business: "success",
} as const;

export default async function AdminOverviewPage() {
  await requireAdminAccess();
  const [m, o] = await Promise.all([getAdminMetrics(), getAdminOverview()]);

  const growthTrend =
    m.growth.newLastMonth > 0
      ? Math.round(
          ((m.growth.newThisMonth - m.growth.newLastMonth) /
            m.growth.newLastMonth) *
            100
        )
      : null;

  return (
    <>
      <PageHeader
        title="Vue d'ensemble"
        description="Santé et croissance de la plateforme Traballo."
      />

      {/* Revenue & growth */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="MRR"
          value={formatEUR(m.revenue.mrr)}
          icon={Wallet}
          hint={`ARR ${formatEUR(m.revenue.arr)}`}
        />
        <StatCard
          label="Artisans"
          value={m.tenants.total}
          icon={Building2}
          hint={`${m.tenants.free} Free · ${m.tenants.pro} Pro · ${m.tenants.business} Business`}
        />
        <StatCard
          label="Nouveaux ce mois"
          value={m.growth.newThisMonth}
          icon={UserPlus}
          trend={
            growthTrend === null
              ? undefined
              : {
                  direction: growthTrend >= 0 ? "up" : "down",
                  label: `${growthTrend >= 0 ? "+" : ""}${growthTrend} %`,
                  good: growthTrend >= 0,
                }
          }
          hint={`${m.growth.newLastMonth} le mois dernier`}
        />
        <StatCard
          label="ARPU (payants)"
          value={formatEUR(m.revenue.arpu)}
          icon={TrendingUp}
          hint={`${m.funnel.paid} comptes payants`}
        />
      </div>

      {/* Funnel */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Taux d'activation"
          value={`${m.funnel.activationRate} %`}
          icon={Rocket}
          hint={`${m.funnel.published}/${m.funnel.onboarded} sites publiés`}
        />
        <StatCard
          label="Conversion payante"
          value={`${m.funnel.conversionRate} %`}
          icon={Globe2}
          hint="Free → Pro / Business"
        />
        <StatCard
          label="Comptes inactifs 30 j"
          value={m.health.inactive30d}
          icon={MoonStar}
          trend={
            m.health.inactive30d > 0
              ? { direction: "up", label: "à surveiller", good: false }
              : undefined
          }
        />
        <StatCard
          label="Facturé ce mois"
          value={formatEUR(m.health.invoicedThisMonth)}
          icon={ReceiptText}
          hint={`${m.health.invoicesThisMonth} factures`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Signups trend */}
        <Card>
          <CardHeader>
            <CardTitle>Inscriptions · 12 semaines</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBarChart
              data={m.weekly.map((w) => ({
                label: formatDate(new Date(w.week), { day: "numeric", month: "short" }),
                value: w.signups,
              }))}
              valueLabel="inscriptions par semaine"
            />
          </CardContent>
        </Card>

        {/* Plan split */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Free", value: m.tenants.free },
              { label: "Pro", value: m.tenants.pro },
              { label: "Business", value: m.tenants.business },
            ].map((row) => {
              const pct = m.tenants.total
                ? Math.round((row.value / m.tenants.total) * 100)
                : 0;
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">
                      {row.value} ({pct} %)
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Product activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité produit · ce mois</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ActivityRow
              icon={ReceiptText}
              label="Factures créées"
              value={m.health.invoicesThisMonth}
            />
            <ActivityRow
              icon={CalendarClock}
              label="Rendez-vous"
              value={m.health.appointmentsThisMonth}
            />
            <ActivityRow
              icon={MessagesSquare}
              label="Conversations agent IA"
              value={m.health.aiConversationsThisMonth}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent signups */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Dernières inscriptions</CardTitle>
          <Link
            href="/admin/tenants"
            className="text-sm font-medium text-primary hover:underline"
          >
            Tout voir
          </Link>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {o.recent.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/admin/tenants/${t.id}`}
                  className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {t.name ?? t.slug}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {t.email ?? t.slug} ·{" "}
                      {formatDate(t.createdAt, { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <Badge variant={PLAN_BADGE[t.plan as keyof typeof PLAN_BADGE]}>
                    {t.plan}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}

function ActivityRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ReceiptText;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
