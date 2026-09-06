import Link from "next/link";
import {
  Wallet,
  Building2,
  UserPlus,
  TrendingUp,
  Rocket,
  Target,
  MoonStar,
  ReceiptText,
  CalendarClock,
  MessagesSquare,
  ArrowRight,
} from "lucide-react";
import { requireAdminAccess } from "@/lib/auth/admin";
import { getAdminMetrics } from "@/lib/admin/metrics";
import { getAdminOverview } from "@/lib/admin/queries";
import { formatEUR, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { AreaChart, BarSeries, Donut, CHART } from "@/components/admin/charts";
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

  const growthDelta =
    m.growth.newLastMonth > 0
      ? Math.round(
          ((m.growth.newThisMonth - m.growth.newLastMonth) /
            m.growth.newLastMonth) *
            100
        )
      : null;

  const weekLabel = (iso: string) =>
    formatDate(new Date(iso), { day: "numeric", month: "short" });

  return (
    <>
      <PageHeader
        title="Vue d'ensemble"
        description="Santé et croissance de la plateforme Traballo."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          label="MRR"
          value={formatEUR(m.revenue.mrr)}
          hint={`ARR ${formatEUR(m.revenue.arr)}`}
          icon={Wallet}
          tone="green"
        />
        <KpiCard
          label="Artisans"
          value={m.tenants.total}
          hint={`${m.funnel.paid} payants`}
          icon={Building2}
          tone="blue"
        />
        <KpiCard
          label="Nouveaux ce mois"
          value={m.growth.newThisMonth}
          hint={`${m.growth.newLastMonth} le mois dernier`}
          icon={UserPlus}
          tone="cyan"
          delta={
            growthDelta === null
              ? undefined
              : { value: growthDelta, good: growthDelta >= 0 }
          }
        />
        <KpiCard
          label="ARPU (payants)"
          value={formatEUR(m.revenue.arpu)}
          icon={TrendingUp}
          tone="purple"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          label="Taux d'activation"
          value={`${m.funnel.activationRate} %`}
          hint={`${m.funnel.published}/${m.funnel.onboarded} sites publiés`}
          icon={Rocket}
          tone="blue"
        />
        <KpiCard
          label="Conversion payante"
          value={`${m.funnel.conversionRate} %`}
          hint="Free → Pro / Business"
          icon={Target}
          tone="green"
        />
        <KpiCard
          label="Inactifs 30 j"
          value={m.health.inactive30d}
          icon={MoonStar}
          tone={m.health.inactive30d > 0 ? "amber" : "blue"}
        />
        <KpiCard
          label="Facturé ce mois"
          value={formatEUR(m.health.invoicedThisMonth)}
          hint={`${m.health.invoicesThisMonth} factures`}
          icon={ReceiptText}
          tone="purple"
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Croissance · 12 semaines</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={m.weekly.map((w) => ({
                label: weekLabel(w.week),
                value: w.cumulative,
              }))}
              color={CHART[1]}
            />
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Inscriptions par semaine
              </p>
              <BarSeries
                data={m.weekly.map((w) => ({
                  label: weekLabel(w.week),
                  value: w.signups,
                }))}
                color={CHART[5]}
                height={90}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Donut
              centerLabel="artisans"
              centerValue={String(m.tenants.total)}
              segments={[
                { label: "Free", value: m.tenants.free, color: CHART[5] },
                { label: "Pro", value: m.tenants.pro, color: CHART[1] },
                { label: "Business", value: m.tenants.business, color: CHART[2] },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Activity + recent */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Activité produit · ce mois</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ActivityRow
              icon={ReceiptText}
              label="Factures créées"
              value={m.health.invoicesThisMonth}
              tone="text-chart-4"
            />
            <ActivityRow
              icon={CalendarClock}
              label="Rendez-vous"
              value={m.health.appointmentsThisMonth}
              tone="text-primary"
            />
            <ActivityRow
              icon={MessagesSquare}
              label="Conversations agent IA"
              value={m.health.aiConversationsThisMonth}
              tone="text-success"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Dernières inscriptions</CardTitle>
            <Link
              href="/admin/tenants"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Tout voir <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {o.recent.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/admin/tenants/${t.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-muted"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
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
      </div>
    </>
  );
}

function ActivityRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ReceiptText;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`size-4 ${tone}`} />
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
