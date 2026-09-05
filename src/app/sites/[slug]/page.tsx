import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolvePublicSite } from "@/lib/artisan/site-data";
import { ArtisanSite } from "@/components/site/artisan-site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await resolvePublicSite(slug);
  if (!site || !site.isPublished) return { title: { absolute: "Site introuvable" } };
  return {
    title: {
      absolute: site.metaTitle || `${site.businessName} — ${site.tradeLabel}`,
    },
    description:
      site.metaDescription ||
      `${site.businessName}, ${site.tradeLabel.toLowerCase()}${site.address ? ` — ${site.address}` : ""}. Devis gratuit.`,
    robots: { index: true, follow: true },
  };
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await resolvePublicSite(slug);
  if (!site || !site.isPublished) notFound();

  return <ArtisanSite site={site} />;
}
