import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { requireAdminAccess } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { tenants, invoices, clients, appointments } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { tradeLabel } from "@/lib/artisan/trades";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      users: { columns: { email: true, fullName: true, role: true, createdAt: true } },
    },
  });
  if (!tenant) notFound();

  const [profile, site, [invCount], [clientCount], [apptCount]] = await Promise.all([
    db.query.artisanProfiles.findFirst({
      where: (p, { eq: e }) => e(p.tenantId, id),
    }),
    db.query.sites.findFirst({ where: (s, { eq: e }) => e(s.tenantId, id) }),
    db.select({ n: sql<number>`count(*)::int` }).from(invoices).where(eq(invoices.tenantId, id)),
    db.select({ n: sql<number>`count(*)::int` }).from(clients).where(eq(clients.tenantId, id)),
    db.select({ n: sql<number>`count(*)::int` }).from(appointments).where(eq(appointments.tenantId, id)),
  ]);

  return (
    <>
      <PageHeader
        title={profile?.businessName ?? tenant.slug}
        breadcrumb={[
          { label: "Artisans", href: "/admin/tenants" },
          { label: profile?.businessName ?? tenant.slug },
        ]}
        actions={<Badge>{tenant.plan}</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Factures" value={invCount.n} />
        <StatCard label="Clients" value={clientCount.n} />
        <StatCard label="Rendez-vous" value={apptCount.n} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row k="Sous-domaine" v={`${tenant.slug}.traballo.pro`} />
            <Row k="Créé le" v={formatDate(tenant.createdAt)} />
            <Row k="Onboarding" v={profile ? "Terminé" : "Incomplet"} />
            <Row
              k="Site"
              v={site ? (site.isPublished ? "Publié" : "Hors ligne") : "Non configuré"}
            />
            {site?.customDomain && <Row k="Domaine" v={site.customDomain} />}
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {tenant.users.map((u) => (
                <li key={u.email} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <div className="font-medium text-foreground">{u.fullName ?? u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <Badge variant="neutral">{u.role}</Badge>
                </li>
              ))}
            </ul>
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
