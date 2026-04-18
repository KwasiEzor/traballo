/**
 * New appointment page
 */

import { requireAuth } from "@/lib/auth";
import { createTenantClient } from "@/lib/db/tenant";
import { AppointmentForm } from "../components/appointment-form";

export default async function NewAppointmentPage() {
  const { tenantId } = await requireAuth();

  const tenantDb = createTenantClient(tenantId);
  const clients = await tenantDb.query.clients.findMany({
    orderBy: (clients, { asc }) => [asc(clients.name)],
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Nouveau rendez-vous</h1>
      <div className="max-w-2xl rounded-lg border bg-white p-6">
        <AppointmentForm clients={clients} />
      </div>
    </div>
  );
}
