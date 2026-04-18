/**
 * Appointment detail page
 */

import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createTenantClient } from "@/lib/db/tenant";
import { AppointmentActions } from "../components/appointment-actions";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AppointmentDetailPage({ params }: PageProps) {
  const { tenantId } = await requireAuth();
  const { id } = await params;

  const tenantDb = createTenantClient(tenantId);
  const appointment = await tenantDb.query.appointments.findFirst({
    where: (appointments, { eq }) => eq(appointments.id, id),
    with: {
      client: true,
    },
  });

  if (!appointment) {
    notFound();
  }

  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/appointments"
          className="mb-2 text-sm text-blue-600 hover:underline"
        >
          ← Retour aux rendez-vous
        </Link>
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold">{appointment.title}</h1>
          <AppointmentActions appointment={appointment} />
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Statut</div>
              <StatusBadge status={appointment.status} />
            </div>

            <div>
              <div className="text-sm text-gray-600">Date</div>
              <div className="font-medium">
                {startDate.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Horaires</div>
              <div className="font-medium">
                {startDate.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" - "}
                {endDate.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {appointment.client && (
              <div>
                <div className="text-sm text-gray-600">Client</div>
                <div className="font-medium">{appointment.client.name}</div>
                {appointment.client.phone && (
                  <div className="text-sm text-gray-600">
                    {appointment.client.phone}
                  </div>
                )}
              </div>
            )}

            {appointment.notes && (
              <div>
                <div className="text-sm text-gray-600">Notes</div>
                <div className="whitespace-pre-wrap">{appointment.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-gray-100 text-gray-800",
  };

  const labels = {
    pending: "En attente",
    confirmed: "Confirmé",
    cancelled: "Annulé",
    completed: "Terminé",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
        styles[status as keyof typeof styles] || styles.pending
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
