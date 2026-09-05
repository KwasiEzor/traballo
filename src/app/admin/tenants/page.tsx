import Link from "next/link";
import { Download } from "lucide-react";
import { requireAdminAccess } from "@/lib/auth/admin";
import { getTenants } from "@/lib/admin/queries";
import { formatDate } from "@/lib/utils";
import { tradeLabel } from "@/lib/artisan/trades";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TenantFilters } from "./tenant-filters";

export const dynamic = "force-dynamic";

const PLAN_BADGE = { free: "neutral", pro: "default", business: "success" } as const;

export default async function AdminTenantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdminAccess();
  const sp = await searchParams;

  const { tenants, total, page, pages } = await getTenants({
    q: sp.q,
    plan: sp.plan as "free" | "pro" | "business" | undefined,
    status: sp.status as "active" | "suspended" | undefined,
    sort: (sp.sort as "recent" | "oldest" | "name" | undefined) ?? "recent",
    page: sp.page ? Number(sp.page) : 1,
  });

  const qs = (extra: Record<string, string | number>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...extra })) {
      if (v !== undefined && v !== "") p.set(k, String(v));
    }
    return `?${p.toString()}`;
  };

  return (
    <>
      <PageHeader
        title="Artisans"
        description={`${total} compte${total > 1 ? "s" : ""}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <a href={`/admin/tenants/export${qs({ page: "" })}`}>
              <Download className="size-4" /> Export CSV
            </a>
          </Button>
        }
      />

      <TenantFilters />

      <Card className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entreprise</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Métier</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Site</TableHead>
              <TableHead className="hidden sm:table-cell">Inscrit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
            {tenants.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Link
                    href={`/admin/tenants/${t.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {t.businessName ?? t.slug}
                  </Link>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {t.slug}
                    {t.status === "suspended" && (
                      <Badge variant="destructive" className="ml-2">
                        Suspendu
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {t.email ?? "—"}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {t.tradeType ? tradeLabel(t.tradeType) : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={PLAN_BADGE[t.plan as keyof typeof PLAN_BADGE]}>
                    {t.plan}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {t.published ? (
                    <span className="text-success">En ligne</span>
                  ) : (
                    <span className="text-muted-foreground">Hors ligne</span>
                  )}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                  {formatDate(t.createdAt, { day: "numeric", month: "short", year: "2-digit" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} / {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={qs({ page: page - 1 })}>Précédent</Link>
              </Button>
            )}
            {page < pages && (
              <Button asChild variant="outline" size="sm">
                <Link href={qs({ page: page + 1 })}>Suivant</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
