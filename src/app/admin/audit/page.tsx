import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminAccess } from "@/lib/auth/admin";
import { listAuditLog } from "@/lib/admin/audit";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Historique admin" };
export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  "tenant.plan_changed": "Changement de plan",
  "tenant.suspended": "Compte suspendu",
  "tenant.reactivated": "Compte réactivé",
  "tenant.verification_resent": "Vérification e-mail renvoyée",
  "tenant.impersonation_started": "Impersonation démarrée",
  "tenant.impersonation_stopped": "Impersonation terminée",
  "tenant.profile_edited": "Profil modifié",
  "tenants.exported": "Export CSV",
  "settings.anthropic_key_set": "Clé Anthropic mise à jour",
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; target?: string }>;
}) {
  await requireAdminAccess();
  const { cursor, target } = await searchParams;
  const { entries, nextCursor } = await listAuditLog({ cursor });

  const shown = target
    ? entries.filter((e) => e.targetId === target)
    : entries;

  return (
    <>
      <PageHeader
        title="Historique admin"
        description="Journal des actions effectuées depuis la console."
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Quand</th>
              <th className="px-4 py-3 font-semibold">Admin</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Cible</th>
              <th className="px-4 py-3 font-semibold">Détails</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Aucune entrée.
                </td>
              </tr>
            )}
            {shown.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatDate(e.createdAt, {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{e.actorEmail}</td>
                <td className="px-4 py-3">
                  <Badge variant="neutral">
                    {ACTION_LABEL[e.action] ?? e.action}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {e.targetType === "tenant" && e.targetId ? (
                    <Link
                      href={`/admin/tenants/${e.targetId}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {e.targetId.slice(0, 8)}…
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {e.meta ? JSON.stringify(e.meta) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {nextCursor && !target && (
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/audit?cursor=${encodeURIComponent(nextCursor)}`}>
              Charger plus
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
