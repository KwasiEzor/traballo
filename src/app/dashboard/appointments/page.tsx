/**
 * Appointments page
 */

import { requireAuth } from "@/lib/auth";
import { createTenantClient } from "@/lib/db/tenant";
import Link from "next/link";

export default async function AppointmentsPage() {
  const { tenantId } = await requireAuth();

  const tenantDb = createTenantClient(tenantId);
  const appointments = await tenantDb.query.appointments.findMany({
    with: {
      client: true,
    },
    orderBy: (appointments, { desc }) => [desc(appointments.startTime)],
  });

  // Group by date
  const grouped = appointments.reduce(
    (acc, apt) => {
      const date = new Date(apt.startTime).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(apt);
      return acc;
    },
    {} as Record<string, typeof appointments>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rendez-vous</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/appointments/availability"
            className="rounded-lg border bg-white px-4 py-2 hover:bg-gray-50"
          >
            ⚙️ Disponibilités
          </Link>
          <Link
            href="/dashboard/appointments/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Nouveau rendez-vous
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="rounded-lg border bg-white p-6 text-center text-gray-600">
            Aucun rendez-vous. Créez votre premier rendez-vous.
          </div>
        ) : (
          Object.entries(grouped).map(([date, apts]) => (
            <div key={date} className="rounded-lg border bg-white">
              <div className="border-b bg-gray-50 px-6 py-3">
                <h2 className="font-semibold">{date}</h2>
              </div>
              <div className="divide-y">
                {apts.map((apt) => (
                  <Link
                    key={apt.id}
                    href={`/dashboard/appointments/${apt.id}`}
                    className="block p-6 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-3">
                          <span className="font-medium">{apt.title}</span>
                          <StatusBadge status={apt.status} />
                        </div>
                        {apt.client && (
                          <div className="text-sm text-gray-600">
                            Client: {apt.client.name}
                          </div>
                        )}
                        {apt.notes && (
                          <div className="mt-1 text-sm text-gray-600">
                            {apt.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div>
                          {new Date(apt.startTime).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div>
                          {new Date(apt.endTime).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
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
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        styles[status as keyof typeof styles] || styles.pending
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
