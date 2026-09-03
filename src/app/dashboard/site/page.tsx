import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { sites as sitesTable, tenants } from "@/db/schema";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { SiteEditor } from "./site-editor";

export const metadata: Metadata = { title: "Mon site" };
export const dynamic = "force-dynamic";

export default async function SitePage() {
  const { tenantId, plan } = await requireAuth();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";

  const [site, tenant] = await Promise.all([
    withTenant(tenantId, (tx) =>
      tx.query.sites.findFirst({ where: eq(sitesTable.tenantId, tenantId) })
    ),
    db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
      columns: { slug: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Mon site"
        description="Personnalisez votre vitrine publique."
      />
      <SiteEditor
        site={site ?? undefined}
        slug={tenant?.slug ?? "mon-site"}
        rootDomain={rootDomain}
        canCustomDomain={plan === "pro" || plan === "business"}
      />
    </>
  );
}
