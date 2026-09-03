import { notFound } from "next/navigation";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { Clock, User } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { appointments as apptTable } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { AppointmentStatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppointmentActions } from "./appointment-actions";

export const dynamic = "force-dynamic";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { tenantId } = await requireAuth();

  const appt = await withTenant(tenantId, (tx) =>
    tx.query.appointments.findFirst({
      where: and(eq(apptTable.id, id), eq(apptTable.tenantId, tenantId)),
      with: { client: true },
    })
  );
  if (!appt) notFound();

  return (
    <>
      <PageHeader
        title={appt.title}
        breadcrumb={[
          { label: "Rendez-vous", href: "/dashboard/appointments" },
          { label: appt.title },
        ]}
        actions={<AppointmentActions id={appt.id} status={appt.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 pt-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Statut</span>
              <AppointmentStatusBadge status={appt.status} />
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <div className="font-medium text-foreground">
                  {formatDate(appt.startTime, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="text-muted-foreground">
                  {formatDate(appt.startTime, { hour: "2-digit", minute: "2-digit" })}
                  {" – "}
                  {formatDate(appt.endTime, { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
            {appt.client && (
              <div className="flex items-start gap-3">
                <User className="mt-0.5 size-4 text-muted-foreground" />
                <Link
                  href={`/dashboard/clients/${appt.clientId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {appt.client.name}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {appt.notes && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Notes
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {appt.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
