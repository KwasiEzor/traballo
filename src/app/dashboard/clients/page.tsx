import Link from "next/link";
import { Plus, Users, Mail, Phone } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { clients as clientsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { tenantId } = await requireAuth();
  const clients = await withTenant(tenantId, (tx) =>
    tx.query.clients.findMany({
      where: eq(clientsTable.tenantId, tenantId),
      orderBy: (c, { asc }) => [asc(c.name)],
    })
  );

  return (
    <>
      <PageHeader
        title="Clients"
        description={`${clients.length} contact${clients.length > 1 ? "s" : ""} au carnet`}
        actions={
          <Button asChild>
            <Link href="/dashboard/clients/new">
              <Plus className="size-4" /> Nouveau client
            </Link>
          </Button>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Votre carnet est vide"
          description="Ajoutez vos clients pour créer des factures et des rendez-vous plus vite."
          action={
            <Button asChild>
              <Link href="/dashboard/clients/new">Ajouter un client</Link>
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
                <TableHead className="hidden md:table-cell">Ajouté le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/dashboard/clients/${c.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {c.name}
                    </Link>
                    {c.address && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {c.address}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                      {c.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3.5" /> {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3.5" /> {c.phone}
                        </span>
                      )}
                      {!c.email && !c.phone && "—"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {formatDate(c.createdAt, { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
