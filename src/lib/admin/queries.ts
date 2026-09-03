import { db } from "@/lib/db";

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

export async function getAllTenants() {
  return db.query.tenants.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    with: {
      users: { columns: { email: true, fullName: true }, limit: 1 },
    },
  });
}
