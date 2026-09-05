import { requireAdminAccess } from "@/lib/auth/admin";
import { getTenantsForExport } from "@/lib/admin/queries";
import { logAdminAction } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(): Promise<Response> {
  const admin = await requireAdminAccess();
  const rows = await getTenantsForExport();

  const header = [
    "slug",
    "entreprise",
    "gerant",
    "email",
    "telephone",
    "metier",
    "plan",
    "statut",
    "site_publie",
    "domaine_custom",
    "inscrit_le",
  ];
  const body = rows.map((r) =>
    [
      r.slug,
      r.businessName,
      r.ownerName,
      r.email,
      r.phone,
      r.tradeType,
      r.plan,
      r.status,
      r.published ? "oui" : "non",
      r.customDomain,
      r.createdAt.toISOString().slice(0, 10),
    ]
      .map(csvCell)
      .join(",")
  );

  await logAdminAction({
    actorEmail: admin.email,
    action: "tenants.exported",
    meta: { count: rows.length },
  });

  const csv = "﻿" + [header.join(","), ...body].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="traballo-artisans-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
