/**
 * Availability configuration page
 */

import { requireAuth } from "@/lib/auth";
import { getTenantId } from "@/lib/auth/tenant";
import { getTenantDb } from "@/lib/db/tenant";
import { AvailabilityForm } from "./components/availability-form";
import Link from "next/link";

export default async function AvailabilityPage() {
  await requireAuth();
  const tenantId = await getTenantId();

  if (!tenantId) {
    return <div>Tenant not found</div>;
  }

  const tenantDb = getTenantDb(tenantId);
  const slots = await tenantDb.query.availability.findMany({
    where: (availability, { eq }) => eq(availability.tenantId, tenantId),
    orderBy: (availability, { asc }) => [asc(availability.dayOfWeek)],
  });

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/appointments"
          className="mb-2 text-sm text-blue-600 hover:underline"
        >
          ← Retour aux rendez-vous
        </Link>
        <h1 className="text-3xl font-bold">Disponibilités</h1>
        <p className="mt-2 text-gray-600">
          Configurez vos horaires de travail hebdomadaires.
        </p>
      </div>

      <div className="max-w-2xl rounded-lg border bg-white p-6">
        <AvailabilityForm existingSlots={slots} />
      </div>
    </div>
  );
}
