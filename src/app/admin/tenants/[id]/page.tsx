import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, sql, desc } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { requireAdminAccess } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import {
  tenants,
  invoices,
  clients,
  appointments,
  aiConversations,
  adminAuditLog,
} from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { tradeLabel } from "@/lib/artisan/trades";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TenantActions } from "./tenant-actions";

export const dynamic = "force-dynamic";

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess();
  const { id } = await params;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, id),
    with: {
      users: {
        columns: { email: true, fullName: true, role: true, createdAt: true },
      },
    },
  });
  if (!tenant) notFound();

  const [profile, site, [invAgg], [clientCount], [apptCount], [aiCount], recentLog] =
    await Promise.all([
      db.query.artisanProfiles.findFirst({
        where: (p, { eq: e }) => e(p.tenantId, id),
      }),
      db.query.sites.findFirst({ where: (s, { eq: e }) => e(s.tenantId, id) }),
      db
        .select({
          n: sql<number>`count(*)::int`,
          total: sql<string>`coalesce(sum(${invoices.total}),0)`,
        })
        .from(invoices)
        .where(eq(invoices.tenantId, id)),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(clients)
        .where(eq(clients.tenantId, id)),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(appointments)
        .where(eq(appointments.tenantId, id)),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(aiConversations)
        .where(eq(aiConversations.tenantId, id)),
      db
        .select()
        .from(adminAuditLog)
        .where(
          sql`${adminAuditLog.targetType} = 'tenant' and ${adminAuditLog.targetId} = ${id}`
        )
        .orderBy(desc(adminAuditLog.createdAt))
        .limit(8),
    ]);

  const owner = tenant.users.find((u) => u.role === "owner") ?? tenant.users[0];

  return (
    <>
      <PageHeader
        title={profile?.businessName ?? tenant.slug}
        breadcrumb={[
          { label: "Artisans", href: "/admin/tenants" },
          { label: profile?.businessName ?? tenant.slug },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge>{tenant.plan}</Badge>
            {tenant.status === "suspended" && (
              <Badge variant="destructive">Suspendu</Badge>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Factures" value={invAgg.n} />
        <StatCard label="Clients" value={clientCount.n} />
        <StatCard label="Rendez-vous" value={apptCount.n} />
        <StatCard label="Conversations IA" value={aiCount.n} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row k="Sous-domaine" v={`${tenant.slug}.traballo.pro`} />
            <Row k="Créé le" v={formatDate(tenant.createdAt)} />
            <Row k="Statut" v={tenant.status === "active" ? "Actif" : "Suspendu"} />
            <Row k="Onboarding" v={profile ? "Terminé" : "Incomplet"} />
            <Row
              k="Site"
              v={site ? (site.isPublished ? "Publié" : "Hors ligne") : "Non configuré"}
            />
            {site?.customDomain && <Row k="Domaine" v={site.customDomain} />}
            {site?.isPublished && (
              <a
                href={`https://${tenant.slug}.traballo.pro`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 pt-1 text-primary hover:underline"
              >
                Voir le site <ExternalLink className="size-3" />
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profil artisan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {profile ? (
              <>
                <Row k="Gérant" v={profile.ownerName} />
                <Row k="Métier" v={tradeLabel(profile.tradeType)} />
                <Row k="E-mail" v={profile.email} />
                <Row k="Téléphone" v={profile.phone ?? "—"} />
                <Row k="TVA" v={profile.vatNumber ?? "—"} />
              </>
            ) : (
              <p className="text-muted-foreground">Profil non renseigné.</p>
            )}
          </CardContent>
        </Card>

        {/* Admin actions */}
        <div className="lg:col-span-2">
          <TenantActions
            tenantId={tenant.id}
            slug={tenant.slug}
            plan={tenant.plan}
            status={tenant.status}
            ownerEmail={owner?.email ?? null}
            ownerName={profile?.ownerName ?? ""}
            phone={profile?.phone ?? ""}
            hasProfile={Boolean(profile)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {tenant.users.map((u) => (
                <li
                  key={u.email}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {u.fullName ?? u.email}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <Badge variant="neutral">{u.role}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Historique admin</CardTitle>
            <Link
              href={`/admin/audit?target=${tenant.id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Tout voir
            </Link>
          </CardHeader>
          <CardContent>
            {recentLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune action.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentLog.map((e) => (
                  <li key={e.id} className="flex justify-between gap-3">
                    <span className="text-foreground">{e.action}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(e.createdAt, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium text-foreground">{v}</span>
    </div>
  );
}
