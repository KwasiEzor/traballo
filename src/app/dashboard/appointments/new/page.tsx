import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { clients as clientsTable } from "@/db/schema";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentForm } from "../appointment-form";

export const metadata: Metadata = { title: "Nouveau rendez-vous" };
export const dynamic = "force-dynamic";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client } = await searchParams;
  const { tenantId } = await requireAuth();
  const clients = await withTenant(tenantId, (tx) =>
    tx.query.clients.findMany({
      where: eq(clientsTable.tenantId, tenantId),
      orderBy: (c, { asc }) => [asc(c.name)],
      columns: { id: true, name: true },
    })
  );

  return (
    <>
      <PageHeader
        title="Nouveau rendez-vous"
        breadcrumb={[
          { label: "Rendez-vous", href: "/dashboard/appointments" },
          { label: "Nouveau" },
        ]}
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <AppointmentForm clients={clients} defaultClientId={client} />
        </CardContent>
      </Card>
    </>
  );
}
