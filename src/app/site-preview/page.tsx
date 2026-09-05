import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenants } from "@/db/schema";
import { resolvePublicSite } from "@/lib/artisan/site-data";
import { ArtisanSite } from "@/components/site/artisan-site";

export const metadata: Metadata = {
  title: { absolute: "Aperçu du site" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SitePreviewPage() {
  const { tenantId } = await requireAuth();

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
    columns: { slug: true },
  });

  const site = tenant ? await resolvePublicSite(tenant.slug) : null;

  if (!site) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="max-w-sm">
          <p className="font-semibold text-slate-900">Aperçu indisponible</p>
          <p className="mt-1.5 text-sm text-slate-500">
            Complétez votre profil pour générer votre site.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            Compléter mon profil
          </Link>
        </div>
      </div>
    );
  }

  return <ArtisanSite site={site} preview />;
}
