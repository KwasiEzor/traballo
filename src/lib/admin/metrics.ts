/**
 * src/lib/admin/metrics.ts
 * Aggregated platform metrics for the super-admin overview.
 * Core `db.select()` / raw `sql` only — the relational query builder stalls
 * through Neon's transaction pooler.
 */

import { and, count, eq, gte, sql, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  tenants,
  sites,
  artisanProfiles,
  invoices,
  appointments,
  aiConversations,
  session as authSession,
  users,
} from "@/db/schema";

const PLAN_PRICE: Record<string, number> = { free: 0, pro: 29, business: 49 };

function monthStart(offset = 0): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + offset, 1);
}
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}
/** ISO string — raw `sql` bind params must not be Date objects (postgres-js, prepare:false). */
function daysAgoIso(n: number): string {
  return daysAgo(n).toISOString();
}

export type AdminMetrics = {
  tenants: { total: number; free: number; pro: number; business: number };
  growth: { newThisMonth: number; newLastMonth: number };
  revenue: { mrr: number; arr: number; arpu: number };
  funnel: {
    onboarded: number;
    published: number;
    activationRate: number;
    paid: number;
    conversionRate: number;
  };
  health: {
    invoicesThisMonth: number;
    invoicedThisMonth: number;
    appointmentsThisMonth: number;
    aiConversationsThisMonth: number;
    inactive30d: number;
  };
  weekly: { week: string; signups: number; cumulative: number }[];
};

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [
    planRows,
    thisMonthRow,
    lastMonthRow,
    onboardedRow,
    publishedRow,
    invThisMonth,
    apptThisMonth,
    aiThisMonth,
    inactiveRow,
    weeklyRows,
    firstTenantRow,
  ] = await Promise.all([
    db.select({ plan: tenants.plan, n: count() }).from(tenants).groupBy(tenants.plan),
    db.select({ n: count() }).from(tenants).where(gte(tenants.createdAt, monthStart())),
    db
      .select({ n: count() })
      .from(tenants)
      .where(and(gte(tenants.createdAt, monthStart(-1)), lt(tenants.createdAt, monthStart()))),
    db.select({ n: count() }).from(artisanProfiles),
    db.select({ n: count() }).from(sites).where(eq(sites.isPublished, true)),
    db
      .select({ n: count(), total: sql<string>`coalesce(sum(${invoices.total}),0)` })
      .from(invoices)
      .where(gte(invoices.createdAt, monthStart())),
    db
      .select({ n: count() })
      .from(appointments)
      .where(gte(appointments.createdAt, monthStart())),
    db
      .select({ n: count() })
      .from(aiConversations)
      .where(gte(aiConversations.createdAt, monthStart())),
    // Tenants whose newest session is younger than 30d — the active ones.
    db.execute<{ n: number }>(sql`
      select count(*)::int as n from ${tenants} t
      where not exists (
        select 1 from ${users} u
        join ${authSession} s on s.user_id = u.id
        where u.tenant_id = t.id and s.created_at >= ${daysAgoIso(30)}::timestamptz
      )
    `),
    db.execute<{ week: string; signups: number }>(sql`
      select to_char(date_trunc('week', ${tenants.createdAt}), 'YYYY-MM-DD') as week,
             count(*)::int as signups
      from ${tenants}
      where ${tenants.createdAt} >= ${daysAgoIso(84)}::timestamptz
      group by 1 order by 1
    `),
    db
      .select({ n: count() })
      .from(tenants)
      .where(lt(tenants.createdAt, daysAgo(84))),
  ]);

  const byPlan = (p: string) =>
    Number(planRows.find((r) => r.plan === p)?.n ?? 0);
  const free = byPlan("free");
  const pro = byPlan("pro");
  const business = byPlan("business");
  const total = free + pro + business;

  const mrr = pro * PLAN_PRICE.pro + business * PLAN_PRICE.business;
  const paid = pro + business;

  const published = Number(publishedRow[0]?.n ?? 0);
  const onboarded = Number(onboardedRow[0]?.n ?? 0);

  let running = Number(firstTenantRow[0]?.n ?? 0);
  const weeklyList = Array.from(
    weeklyRows as unknown as Iterable<{ week: string; signups: number }>
  );
  const weekly = weeklyList.map((r) => {
    running += Number(r.signups);
    return { week: r.week, signups: Number(r.signups), cumulative: running };
  });

  return {
    tenants: { total, free, pro, business },
    growth: {
      newThisMonth: Number(thisMonthRow[0]?.n ?? 0),
      newLastMonth: Number(lastMonthRow[0]?.n ?? 0),
    },
    revenue: {
      mrr,
      arr: mrr * 12,
      arpu: paid ? Math.round((mrr / paid) * 10) / 10 : 0,
    },
    funnel: {
      onboarded,
      published,
      activationRate: onboarded ? Math.round((published / onboarded) * 100) : 0,
      paid,
      conversionRate: total ? Math.round((paid / total) * 100) : 0,
    },
    health: {
      invoicesThisMonth: Number(invThisMonth[0]?.n ?? 0),
      invoicedThisMonth: Math.round(Number(invThisMonth[0]?.total ?? 0)),
      appointmentsThisMonth: Number(apptThisMonth[0]?.n ?? 0),
      aiConversationsThisMonth: Number(aiThisMonth[0]?.n ?? 0),
      inactive30d: Number(
        Array.from(inactiveRow as unknown as Iterable<{ n: number }>)[0]?.n ?? 0
      ),
    },
    weekly,
  };
}
