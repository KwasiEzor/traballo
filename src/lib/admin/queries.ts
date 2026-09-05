import { db } from "@/lib/db";
import { artisanProfiles, sites } from "@/db/schema";

const PLAN_PRICE: Record<string, number> = { free: 0, pro: 29, business: 49 };

export async function getAdminOverview() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const all = await db.query.tenants.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    with: {
      users: { columns: { email: true, fullName: true }, limit: 1 },
    },
  });

  const by = (plan: string) => all.filter((t) => t.plan === plan).length;
  const pro = by("pro");
  const business = by("business");

  return {
    total: all.length,
    free: by("free"),
    pro,
    business,
    newThisMonth: all.filter((t) => t.createdAt >= monthStart).length,
    mrr: pro * PLAN_PRICE.pro + business * PLAN_PRICE.business,
    recent: all.slice(0, 8).map((t) => ({
      id: t.id,
      slug: t.slug,
      plan: t.plan,
      createdAt: t.createdAt,
      email: t.users[0]?.email ?? null,
      name: t.users[0]?.fullName ?? null,
    })),
  };
}

export type TenantFilter = {
  q?: string;
  plan?: "free" | "pro" | "business";
  status?: "active" | "suspended";
  sort?: "recent" | "oldest" | "name";
  page?: number;
  perPage?: number;
};

export type TenantRow = {
  id: string;
  slug: string;
  plan: string;
  status: string;
  createdAt: Date;
  email: string | null;
  ownerName: string | null;
  businessName: string | null;
  tradeType: string | null;
  phone: string | null;
  published: boolean;
  customDomain: string | null;
};

async function loadTenantRows(): Promise<TenantRow[]> {
  const [tenantRows, profileRows, siteRows] = await Promise.all([
    db.query.tenants.findMany({
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      with: { users: { columns: { email: true, fullName: true }, limit: 1 } },
    }),
    db
      .select({
        tenantId: artisanProfiles.tenantId,
        businessName: artisanProfiles.businessName,
        ownerName: artisanProfiles.ownerName,
        tradeType: artisanProfiles.tradeType,
        phone: artisanProfiles.phone,
      })
      .from(artisanProfiles),
    db
      .select({
        tenantId: sites.tenantId,
        isPublished: sites.isPublished,
        customDomain: sites.customDomain,
      })
      .from(sites),
  ]);

  const pById = new Map(profileRows.map((p) => [p.tenantId, p]));
  const sById = new Map(siteRows.map((s) => [s.tenantId, s]));

  return tenantRows.map((t) => {
    const p = pById.get(t.id);
    const s = sById.get(t.id);
    return {
      id: t.id,
      slug: t.slug,
      plan: t.plan,
      status: t.status,
      createdAt: t.createdAt,
      email: t.users[0]?.email ?? null,
      ownerName: p?.ownerName ?? t.users[0]?.fullName ?? null,
      businessName: p?.businessName ?? null,
      tradeType: p?.tradeType ?? null,
      phone: p?.phone ?? null,
      published: Boolean(s?.isPublished),
      customDomain: s?.customDomain ?? null,
    };
  });
}

export async function getTenants(filter: TenantFilter = {}) {
  const perPage = Math.min(filter.perPage ?? 25, 100);
  const page = Math.max(filter.page ?? 1, 1);

  let rows = await loadTenantRows();

  if (filter.plan) rows = rows.filter((t) => t.plan === filter.plan);
  if (filter.status) rows = rows.filter((t) => t.status === filter.status);
  if (filter.q) {
    const q = filter.q.toLowerCase();
    rows = rows.filter(
      (t) =>
        t.slug.toLowerCase().includes(q) ||
        t.businessName?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.ownerName?.toLowerCase().includes(q)
    );
  }
  if (filter.sort === "oldest") {
    rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } else if (filter.sort === "name") {
    rows.sort((a, b) =>
      (a.businessName ?? a.slug).localeCompare(b.businessName ?? b.slug)
    );
  }

  const total = rows.length;
  return {
    tenants: rows.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    perPage,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** All tenants, flat, for CSV export. */
export async function getTenantsForExport(): Promise<TenantRow[]> {
  return loadTenantRows();
}
