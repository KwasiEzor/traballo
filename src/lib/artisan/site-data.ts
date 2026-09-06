import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants, sites, artisanProfiles, aiAgentConfig } from "@/db/schema";
import { tradeLabel } from "@/lib/artisan/trades";

export interface PublicSite {
  slug: string;
  businessName: string;
  ownerName: string;
  tradeType: string | null;
  tradeLabel: string;
  email: string;
  phone: string | null;
  whatsappNumber: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  logoUrl: string | null;
  primaryColor: string;
  templateId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  /** Owner's plan — gates premium templates / sections. */
  plan: "free" | "pro" | "business";
  /** Raw sites.sections jsonb (template + section overrides). */
  config: unknown;
  /** Website AI assistant — null when never configured. */
  agent: {
    enabled: boolean;
    agentName: string;
    openingMessage: string;
  } | null;
}

/** Default services shown per trade when the artisan hasn't customised them. */
const TRADE_SERVICES: Record<string, { title: string; text: string }[]> = {
  plombier: [
    { title: "Dépannage urgent", text: "Fuite, canalisation bouchée, chauffe-eau en panne — intervention rapide." },
    { title: "Installation sanitaire", text: "Robinetterie, WC, douche, chauffe-eau, mise aux normes." },
    { title: "Chauffage", text: "Entretien de chaudière, radiateurs, plancher chauffant." },
  ],
  electricien: [
    { title: "Dépannage électrique", text: "Panne, disjoncteur qui saute, prise défectueuse." },
    { title: "Mise aux normes", text: "Tableau électrique, mise à la terre, diagnostic." },
    { title: "Installation", text: "Éclairage, prises, borne de recharge, domotique." },
  ],
  nettoyage: [
    { title: "Entretien régulier", text: "Bureaux, commerces, copropriétés — prestations sur mesure." },
    { title: "Remise en état", text: "Après travaux, avant emménagement, nettoyage de printemps." },
    { title: "Vitrerie", text: "Nettoyage de vitres et surfaces vitrées en hauteur." },
  ],
  menuisier: [
    { title: "Fabrication sur mesure", text: "Meubles, placards, escaliers, agencement intérieur." },
    { title: "Pose", text: "Portes, fenêtres, parquet, terrasse bois." },
    { title: "Rénovation", text: "Restauration de menuiseries anciennes, ajustements." },
  ],
};

const DEFAULT_SERVICES = [
  { title: "Devis gratuit", text: "Étude de votre besoin et chiffrage sans engagement." },
  { title: "Intervention soignée", text: "Travail propre, dans les délais annoncés." },
  { title: "Suivi", text: "Disponible après l'intervention pour toute question." },
];

export function servicesFor(trade: string | null) {
  return (trade && TRADE_SERVICES[trade]) || DEFAULT_SERVICES;
}

/** Trades with a dedicated hero photo in /public/templates/trades. */
const TRADES_WITH_PHOTO = new Set([
  "plombier",
  "electricien",
  "menuisier",
  "macon",
  "peintre",
  "carreleur",
  "couvreur",
  "serrurier",
  "jardinier",
  "nettoyage",
  "demenagement",
  "reparation",
]);

/** Default hero image for a trade — professional stock photo (Pexels). */
export function heroImageFor(trade: string | null) {
  const key = trade && TRADES_WITH_PHOTO.has(trade) ? trade : "autre";
  return `/templates/trades/${key}.webp`;
}

export const resolvePublicSite = cache(async function resolvePublicSite(
  slug: string
): Promise<PublicSite | null> {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
    columns: { id: true, slug: true, plan: true, status: true },
  });
  if (!tenant || tenant.status === "suspended") return null;

  const [site, profile, agent] = await Promise.all([
    db.query.sites.findFirst({ where: eq(sites.tenantId, tenant.id) }),
    db.query.artisanProfiles.findFirst({
      where: eq(artisanProfiles.tenantId, tenant.id),
    }),
    db.query.aiAgentConfig.findFirst({
      where: eq(aiAgentConfig.tenantId, tenant.id),
      columns: { isEnabled: true, agentName: true, openingMessage: true },
    }),
  ]);
  if (!site || !profile) return null;

  return {
    slug: tenant.slug,
    businessName: profile.businessName,
    ownerName: profile.ownerName,
    tradeType: profile.tradeType,
    tradeLabel: tradeLabel(profile.tradeType),
    email: profile.email,
    phone: profile.phone,
    whatsappNumber: profile.whatsappNumber,
    address: profile.address,
    latitude: profile.latitude ?? null,
    longitude: profile.longitude ?? null,
    logoUrl: profile.logoUrl,
    primaryColor: site.primaryColor || "#1f5fc4",
    templateId: site.templateId || "standard",
    metaTitle: site.metaTitle,
    metaDescription: site.metaDescription,
    isPublished: site.isPublished,
    plan: tenant.plan,
    config: site.sections ?? null,
    agent: agent
      ? {
          // The website assistant is a Business-tier feature.
          enabled: agent.isEnabled && tenant.plan === "business",
          agentName: agent.agentName?.trim() || "Assistant",
          openingMessage:
            agent.openingMessage?.trim() ||
            `Bonjour, je suis l'assistant de ${profile.businessName}. Comment puis-je vous aider ?`,
        }
      : null,
  };
});
