import Link from "next/link";
import { Building2, TrendingUp, UserPlus, Wallet } from "lucide-react";
import { getAdminOverview } from "@/lib/admin/queries";
import { formatEUR, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const PLAN_BADGE = {
  free: "neutral",
  pro: "default",
  business: "success",
} as const;

export default async function AdminOverviewPage() {
  const o = await getAdminOverview();

  return (
    <>
      <PageHeader
        title="Vue d'ensemble"
        description="Activité de la plateforme Traballo."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Artisans" value={o.total} icon={Building2} hint="comptes" />
        <StatCard
          label="Nouveaux ce mois"
          value={o.newThisMonth}
          icon={UserPlus}
        />
        <StatCard
          label="Payants"
          value={o.pro + o.business}
          icon={TrendingUp}
          hint={`${o.pro} Pro · ${o.business} Business`}
        />
        <StatCard label="MRR estimé" value={formatEUR(o.mrr)} icon={Wallet} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Free", value: o.free },
              { label: "Pro", value: o.pro },
              { label: "Business", value: o.business },
            ].map((row) => {
              const pct = o.total ? Math.round((row.value / o.total) * 100) : 0;
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

        <Card className="lg:col-span-2">
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
                        {t.email ?? t.slug} · {formatDate(t.createdAt, { day: "numeric", month: "short" })}
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
