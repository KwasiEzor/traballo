import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { invoices, appointments, clients } from "@/db/schema";

export interface DashboardSummary {
  paidThisMonth: number;
  outstanding: number;
  outstandingCount: number;
  upcomingAppointments: number;
  pendingAppointments: number;
  clientCount: number;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    total: string;
    status: string;
    issueDate: string;
    clientName: string | null;
  }>;
  nextAppointments: Array<{
    id: string;
    title: string;
    startTime: Date;
    status: string;
    clientName: string | null;
  }>;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { tenantId } = await requireAuth();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return withTenant(tenantId, async (tx) => {
    const [paidAgg] = await tx
      .select({ sum: sql<string>`coalesce(sum(${invoices.total}), 0)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.status, "paid"),
          gte(invoices.paidAt, monthStart)
        )
      );

    const [outAgg] = await tx
      .select({
        sum: sql<string>`coalesce(sum(${invoices.total}), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          inArray(invoices.status, ["sent", "viewed", "overdue"])
        )
      );

    const [apptAgg] = await tx
      .select({
        upcoming: sql<number>`count(*) filter (where ${appointments.startTime} >= now())::int`,
        pending: sql<number>`count(*) filter (where ${appointments.status} = 'pending')::int`,
      })
      .from(appointments)
      .where(eq(appointments.tenantId, tenantId));

    const [clientAgg] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(clients)
      .where(eq(clients.tenantId, tenantId));

    const recentInvoices = await tx.query.invoices.findMany({
      where: eq(invoices.tenantId, tenantId),
      orderBy: (i, { desc }) => [desc(i.createdAt)],
      limit: 5,
      with: { client: { columns: { name: true } } },
    });

    const nextAppointments = await tx.query.appointments.findMany({
      where: and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.startTime, now)
      ),
      orderBy: (a, { asc }) => [asc(a.startTime)],
      limit: 5,
      with: { client: { columns: { name: true } } },
    });

    return {
      paidThisMonth: Number(paidAgg?.sum ?? 0),
      outstanding: Number(outAgg?.sum ?? 0),
      outstandingCount: outAgg?.count ?? 0,
      upcomingAppointments: apptAgg?.upcoming ?? 0,
      pendingAppointments: apptAgg?.pending ?? 0,
      clientCount: clientAgg?.count ?? 0,
      recentInvoices: recentInvoices.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        total: i.total,
        status: i.status,
        issueDate: i.issueDate,
        clientName: i.client?.name ?? null,
      })),
      nextAppointments: nextAppointments.map((a) => ({
        id: a.id,
        title: a.title,
        startTime: a.startTime,
        status: a.status,
        clientName: a.client?.name ?? null,
      })),
    };
  });
}
