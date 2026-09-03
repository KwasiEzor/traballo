import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants, sites, artisanProfiles } from "@/db/schema";
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
  logoUrl: string | null;
  primaryColor: string;
  templateId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
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

export const resolvePublicSite = cache(async function resolvePublicSite(
  slug: string
): Promise<PublicSite | null> {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
    columns: { id: true, slug: true },
  });
  if (!tenant) return null;

  const [site, profile] = await Promise.all([
    db.query.sites.findFirst({ where: eq(sites.tenantId, tenant.id) }),
    db.query.artisanProfiles.findFirst({
      where: eq(artisanProfiles.tenantId, tenant.id),
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
    logoUrl: profile.logoUrl,
    primaryColor: site.primaryColor || "#1f5fc4",
    templateId: site.templateId || "default",
    metaTitle: site.metaTitle,
    metaDescription: site.metaDescription,
    isPublished: site.isPublished,
  };
});
