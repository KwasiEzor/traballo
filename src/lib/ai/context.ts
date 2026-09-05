/**
 * src/lib/ai/context.ts
 * Loads everything the website agent needs for one visitor turn, keyed by the
 * public site slug. Uses the owner DB connection (public route, no session).
 */

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  tenants,
  artisanProfiles,
  sites,
  aiAgentConfig,
  type AiAgentConfig,
} from "@/db/schema";
import { tradeLabel } from "@/lib/artisan/trades";
import { servicesFor, type PublicSite } from "@/lib/artisan/site-data";
import { resolveSiteConfig } from "@/lib/artisan/site-config";

export type AgentContext = {
  tenantId: string;
  plan: PublicSite["plan"];
  site: PublicSite;
  config: AiAgentConfig;
  services: { title: string; text: string }[];
  area: string;
};

export async function loadAgentContext(
  slug: string
): Promise<AgentContext | null> {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
    columns: { id: true, slug: true, plan: true },
  });
  if (!tenant) return null;

  const [profile, site, config] = await Promise.all([
    db.query.artisanProfiles.findFirst({
      where: eq(artisanProfiles.tenantId, tenant.id),
    }),
    db.query.sites.findFirst({ where: eq(sites.tenantId, tenant.id) }),
    db.query.aiAgentConfig.findFirst({
      where: eq(aiAgentConfig.tenantId, tenant.id),
    }),
  ]);
  if (!profile || !site || !config) return null;
  // Website assistant is Business-tier only.
  if (tenant.plan !== "business") return null;

  const publicSite: PublicSite = {
    slug: tenant.slug,
    businessName: profile.businessName,
    ownerName: profile.ownerName,
    tradeType: profile.tradeType,
    tradeLabel: tradeLabel(profile.tradeType),
    email: profile.email,
    phone: profile.phone,
    whatsappNumber: profile.whatsappNumber,
    address: profile.address,
    logoUrl: profile.logoUrl,
    primaryColor: site.primaryColor || "#1f5fc4",
    templateId: site.templateId || "standard",
    metaTitle: site.metaTitle,
    metaDescription: site.metaDescription,
    isPublished: site.isPublished,
    plan: tenant.plan,
    config: site.sections ?? null,
    agent: {
      enabled: config.isEnabled,
      agentName: config.agentName,
      openingMessage: config.openingMessage ?? "",
    },
  };

  const area =
    profile.address?.split("·").pop()?.trim() ||
    profile.address ||
    "votre région";

  // Prefer the services the artisan customised on their site, fall back to
  // the trade defaults.
  let services = servicesFor(profile.tradeType);
  try {
    const resolved = resolveSiteConfig(publicSite, area, tenant.plan, publicSite.config);
    const custom = resolved.sections.find((s) => s.key === "services")
      ?.content as { items?: { title: string; text: string }[] } | undefined;
    if (custom?.items?.length) services = custom.items;
  } catch {
    // keep the trade defaults
  }

  return {
    tenantId: tenant.id,
    plan: tenant.plan,
    site: publicSite,
    config,
    services,
    area,
  };
}
