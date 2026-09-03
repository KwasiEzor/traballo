import Link from "next/link";
import { Plus, CalendarDays, CalendarClock, Settings2 } from "lucide-react";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { appointments as apptTable } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AppointmentStatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const { tenantId } = await requireAuth();
  const rows = await withTenant(tenantId, (tx) =>
    tx.query.appointments.findMany({
      where: eq(apptTable.tenantId, tenantId),
      orderBy: (a, { asc }) => [asc(a.startTime)],
      with: { client: { columns: { name: true } } },
    })
  );

  const now = Date.now();
  const upcoming = rows.filter((a) => a.startTime.getTime() >= now);
  const past = rows
    .filter((a) => a.startTime.getTime() < now)
    .reverse();

  return (
    <>
      <PageHeader
        title="Rendez-vous"
        description={`${upcoming.length} à venir`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/appointments/availability">
                <Settings2 className="size-4" /> Disponibilités
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/appointments/new">
                <Plus className="size-4" /> Nouveau
              </Link>
            </Button>
          </>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Aucun rendez-vous"
          description="Définissez vos disponibilités puis planifiez votre premier rendez-vous."
          action={
            <Button asChild>
              <Link href="/dashboard/appointments/new">Planifier</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          <Section
            icon={CalendarClock}
            title="À venir"
            items={upcoming}
            emptyLabel="Aucun rendez-vous à venir."
          />
          {past.length > 0 && (
            <Section icon={CalendarDays} title="Passés" items={past} muted />
          )}
        </div>
      )}
    </>
  );
}

function Section({
  icon: Icon,
  title,
  items,
  emptyLabel,
  muted,
}: {
  icon: typeof CalendarDays;
  title: string;
  items: Array<{
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    status: string;
    client: { name: string } | null;
  }>;
  emptyLabel?: string;
  muted?: boolean;
}) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {items.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/dashboard/appointments/${a.id}`}
                    className={`flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted ${
                      muted ? "opacity-70" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">{a.title}</div>
                      <div className="truncate text-sm text-muted-foreground">
                        {a.client?.name ? `${a.client.name} · ` : ""}
                        {formatDate(a.startTime, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
