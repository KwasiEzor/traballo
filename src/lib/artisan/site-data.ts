import { cache } from "react";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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
  macon: [
    { title: "Gros œuvre", text: "Fondations, murs porteurs, dalles — construction dans les règles de l'art." },
    { title: "Extension & agrandissement", text: "Garage, véranda, surélévation, de l'étude à la livraison." },
    { title: "Rénovation", text: "Ouverture de mur, reprise en sous-œuvre, ravalement de façade." },
  ],
  peintre: [
    { title: "Peinture intérieure", text: "Murs, plafonds, boiseries — finitions soignées, choix des teintes." },
    { title: "Peinture extérieure", text: "Façades, volets, ravalement, protection durable contre les intempéries." },
    { title: "Revêtements muraux", text: "Papier peint, enduits décoratifs, toile de verre." },
  ],
  carreleur: [
    { title: "Pose de carrelage", text: "Sol et mur, intérieur et extérieur, tous formats et matériaux." },
    { title: "Salle de bain & cuisine", text: "Faïence, douche à l'italienne, plan de travail carrelé." },
    { title: "Rénovation de joints", text: "Reprise de joints abîmés, étanchéité, remplacement de carreaux cassés." },
  ],
  couvreur: [
    { title: "Réfection de toiture", text: "Tuiles, ardoises, zinguerie — remplacement et réparation." },
    { title: "Étanchéité", text: "Traitement des fuites, isolation de toiture, entretien de gouttières." },
    { title: "Charpente", text: "Diagnostic, renforcement, traitement contre les nuisibles." },
  ],
  serrurier: [
    { title: "Dépannage urgent", text: "Porte claquée, serrure bloquée — intervention rapide 24 h/24." },
    { title: "Installation & sécurisation", text: "Serrures multipoints, blindage de porte, verrous certifiés." },
    { title: "Métallerie", text: "Portails, grilles, garde-corps sur mesure." },
  ],
  jardinier: [
    { title: "Entretien des espaces verts", text: "Tonte, taille, désherbage — un jardin entretenu toute l'année." },
    { title: "Aménagement paysager", text: "Création de massifs, plantations, terrasses et allées." },
    { title: "Élagage", text: "Taille raisonnée des arbres et haies, évacuation des déchets verts." },
  ],
  demenagement: [
    { title: "Déménagement complet", text: "Emballage, transport, remontage des meubles — clé en main." },
    { title: "Garde-meuble", text: "Stockage sécurisé de courte ou longue durée." },
    { title: "Manutention", text: "Levage, portage d'objets lourds ou volumineux." },
  ],
  reparation: [
    { title: "Dépannage à domicile", text: "Lave-linge, réfrigérateur, four — diagnostic et réparation rapide." },
    { title: "Pièces détachées", text: "Remplacement de pièces d'origine, garantie sur l'intervention." },
    { title: "Entretien préventif", text: "Contrôle régulier pour prolonger la durée de vie de vos appareils." },
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

/**
 * Bust the public site's page cache for a tenant. `/sites/[slug]` has no
 * `dynamic`/`revalidate` export, so without this call Next.js keeps serving
 * the HTML rendered on the first visit after deploy — profile, trade type,
 * hero image, publish status, etc. never update on the live site until the
 * next deployment. Call from every action that writes to `sites` or
 * `artisan_profiles`.
 */
export async function revalidatePublicSite(tenantId: string): Promise<void> {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
    columns: { slug: true },
  });
  if (tenant?.slug) revalidatePath(`/sites/${tenant.slug}`);
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
