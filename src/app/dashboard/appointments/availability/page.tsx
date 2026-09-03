import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { availability as availabilityTable } from "@/db/schema";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AvailabilityForm } from "./availability-form";

export const metadata: Metadata = { title: "Disponibilités" };
export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const { tenantId } = await requireAuth();
  const slots = await withTenant(tenantId, (tx) =>
    tx.query.availability.findMany({
      where: eq(availabilityTable.tenantId, tenantId),
      orderBy: (a, { asc }) => [asc(a.dayOfWeek)],
    })
  );

  return (
    <>
      <PageHeader
        title="Disponibilités"
        description="Vos créneaux hebdomadaires. Vos clients ne peuvent réserver que dans ces plages."
        breadcrumb={[
          { label: "Rendez-vous", href: "/dashboard/appointments" },
          { label: "Disponibilités" },
        ]}
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <AvailabilityForm existingSlots={slots} />
        </CardContent>
      </Card>
    </>
  );
}
