/**
 * Clients page
 */

import { requireAuth } from "@/lib/auth";
import { createTenantClient } from "@/lib/db/tenant";
import Link from "next/link";

export default async function ClientsPage() {
  const { tenantId } = await requireAuth();

  const tenantDb = createTenantClient(tenantId);
  const clients = await tenantDb.query.clients.findMany({
    orderBy: (clients, { asc }) => [asc(clients.name)],
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Nouveau client
        </Link>
      </div>

      <div className="rounded-lg border bg-white">
        {clients.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            Aucun client. Ajoutez votre premier client.
          </div>
        ) : (
          <div className="divide-y">
            {clients.map((client) => (
              <div key={client.id} className="p-4 hover:bg-gray-50">
                <div className="font-medium">{client.name}</div>
                {client.email && (
                  <div className="text-sm text-gray-600">{client.email}</div>
                )}
                {client.phone && (
                  <div className="text-sm text-gray-600">{client.phone}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
