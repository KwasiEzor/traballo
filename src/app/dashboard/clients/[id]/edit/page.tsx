import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { clients as clientsTable } from "@/db/schema";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ClientForm } from "../../client-form";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { tenantId } = await requireAuth();
  const client = await withTenant(tenantId, (tx) =>
    tx.query.clients.findFirst({
      where: and(eq(clientsTable.id, id), eq(clientsTable.tenantId, tenantId)),
    })
  );
  if (!client) notFound();

  return (
    <>
      <PageHeader
        title={`Modifier ${client.name}`}
        breadcrumb={[
          { label: "Clients", href: "/dashboard/clients" },
          { label: client.name, href: `/dashboard/clients/${client.id}` },
          { label: "Modifier" },
        ]}
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <ClientForm client={client} />
        </CardContent>
      </Card>
    </>
  );
}
