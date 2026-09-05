import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { sites as sitesTable, tenants } from "@/db/schema";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { SitePreviewFrame } from "@/components/dashboard/site-preview-frame";
import { isPremiumPlan } from "@/lib/artisan/templates";
import type { StoredSiteConfig } from "@/lib/artisan/site-config";
import { SiteEditor } from "./site-editor";
import { DesignEditor } from "@/components/dashboard/design-editor";

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

  const config = (site?.sections ?? {}) as StoredSiteConfig;

  return (
    <>
      <PageHeader
        title="Mon site"
        description="Personnalisez votre vitrine publique."
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <DesignEditor config={config} isPaid={isPremiumPlan(plan)} />
          <SiteEditor
            site={site ?? undefined}
            slug={tenant?.slug ?? "mon-site"}
            rootDomain={rootDomain}
            canCustomDomain={isPremiumPlan(plan)}
          />
        </div>
        <div className="self-start lg:sticky lg:top-6">
          <div className="mb-2 text-sm font-medium text-foreground">Aperçu</div>
          <SitePreviewFrame previewUrl="/site-preview" />
        </div>
      </div>
    </>
  );
}
