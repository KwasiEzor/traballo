import Link from "next/link";
import { getAllTenants } from "@/lib/admin/queries";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const PLAN_BADGE = { free: "neutral", pro: "default", business: "success" } as const;

export default async function AdminTenantsPage() {
  const tenants = await getAllTenants();

  return (
    <>
      <PageHeader title="Artisans" description={`${tenants.length} comptes`} />
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entreprise</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Sous-domaine</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Inscrit le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Link
                    href={`/admin/tenants/${t.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {t.users[0]?.fullName ?? t.slug}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t.users[0]?.email ?? "—"}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {t.slug}
                </TableCell>
                <TableCell>
                  <Badge variant={PLAN_BADGE[t.plan as keyof typeof PLAN_BADGE]}>
                    {t.plan}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(t.createdAt, { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
