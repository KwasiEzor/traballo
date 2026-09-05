import { z } from "zod";
import {
  TEMPLATES,
  MOVABLE_SECTIONS,
  PREMIUM_SECTIONS,
  getTemplate,
  isPremiumPlan,
  type SectionKey,
  type TemplateId,
} from "@/lib/artisan/templates";
import { servicesFor, type PublicSite } from "@/lib/artisan/site-data";

/* --------------------------------- types --------------------------------- */

export interface ServiceItem {
  title: string;
  text: string;
}
export interface ReviewItem {
  name: string;
  text: string;
  rating?: number;
}
export interface HourRow {
  label: string;
  value: string;
}

export interface SectionContent {
  hero?: { eyebrow?: string; headline?: string; subhead?: string };
  services?: { title?: string; items?: ServiceItem[] };
  about?: { title?: string; body?: string };
  zones?: { title?: string; items?: string[] };
  reviews?: { title?: string; items?: ReviewItem[] };
  hours?: { title?: string; note?: string; days?: HourRow[] };
  trust?: { title?: string; items?: ServiceItem[] };
  cta?: { title?: string; body?: string };
  contact?: { title?: string; body?: string };
}

/** Stored verbatim in sites.sections (jsonb). All fields optional. */
export interface StoredSiteConfig {
  template?: TemplateId;
  order?: SectionKey[];
  disabled?: SectionKey[];
  content?: SectionContent;
}

export interface ResolvedSection {
  key: SectionKey;
  content: NonNullable<SectionContent[keyof SectionContent]>;
}

export interface ResolvedSiteConfig {
  templateId: TemplateId;
  /** true when the artisan picked a premium template but is on the free plan. */
  downgraded: boolean;
  premiumLocked: boolean;
  sections: ResolvedSection[];
}

/* ------------------------------- validation ------------------------------ */

const serviceItem = z.object({
  title: z.string().trim().max(80),
  text: z.string().trim().max(280),
});
const reviewItem = z.object({
  name: z.string().trim().max(80),
  text: z.string().trim().max(400),
  rating: z.number().int().min(1).max(5).optional(),
});
const hourRow = z.object({
  label: z.string().trim().max(24),
  value: z.string().trim().max(40),
});

export const siteConfigSchema = z.object({
  template: z.enum(["standard", "epure", "signature"]).optional(),
  order: z.array(z.string()).optional(),
  disabled: z.array(z.string()).optional(),
  content: z
    .object({
      hero: z
        .object({
          eyebrow: z.string().trim().max(80).optional(),
          headline: z.string().trim().max(120).optional(),
          subhead: z.string().trim().max(320).optional(),
        })
        .optional(),
      services: z
        .object({
          title: z.string().trim().max(80).optional(),
          items: z.array(serviceItem).max(9).optional(),
        })
        .optional(),
      about: z
        .object({
          title: z.string().trim().max(80).optional(),
          body: z.string().trim().max(1200).optional(),
        })
        .optional(),
      zones: z
        .object({
          title: z.string().trim().max(80).optional(),
          items: z.array(z.string().trim().max(60)).max(30).optional(),
        })
        .optional(),
      reviews: z
        .object({
          title: z.string().trim().max(80).optional(),
          items: z.array(reviewItem).max(12).optional(),
        })
        .optional(),
      hours: z
        .object({
          title: z.string().trim().max(80).optional(),
          note: z.string().trim().max(200).optional(),
          days: z.array(hourRow).max(7).optional(),
        })
        .optional(),
      trust: z
        .object({
          title: z.string().trim().max(80).optional(),
          items: z.array(serviceItem).max(4).optional(),
        })
        .optional(),
      cta: z
        .object({
          title: z.string().trim().max(120).optional(),
          body: z.string().trim().max(280).optional(),
        })
        .optional(),
      contact: z
        .object({
          title: z.string().trim().max(80).optional(),
          body: z.string().trim().max(280).optional(),
        })
        .optional(),
    })
    .optional(),
});

/* -------------------------------- defaults ------------------------------- */

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function zonesFrom(site: PublicSite, area: string): string[] {
  const raw = site.address?.split("·").pop()?.trim() || area;
  // "Lyon, Villeurbanne, Caluire" -> a chip per town.
  // "Lyon et périphérie (20 km)" -> kept as one chip.
  const parts = raw
    .split(/[,;/]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 1);
  return parts.length > 1 ? parts.slice(0, 12) : [raw];
}

const DEFAULT_HOURS: HourRow[] = [
  { label: "Lundi – Vendredi", value: "8 h – 18 h" },
  { label: "Samedi", value: "Sur rendez-vous" },
  { label: "Dimanche", value: "Fermé" },
];

const DEFAULT_TRUST: ServiceItem[] = [
  {
    title: "Réactivité",
    text: "Réponse rapide à votre demande, intervention planifiée sans délai inutile.",
  },
  {
    title: "Travail garanti",
    text: "Prestations réalisées dans les règles de l'art, facture conforme.",
  },
  {
    title: "Clients satisfaits",
    text: "Une relation de confiance construite chantier après chantier.",
  },
];

function defaultContent(
  key: SectionKey,
  site: PublicSite,
  area: string
): ResolvedSection["content"] {
  const t = site.tradeLabel.toLowerCase();
  switch (key) {
    case "hero":
      return {
        eyebrow: `${site.tradeLabel} · ${area}`,
        headline: `${site.businessName}, votre ${t} de confiance`,
        subhead: `Intervention soignée, devis gratuit, délais respectés. Contactez-nous pour toute demande à ${area}.`,
      };
    case "services":
      return { title: "Nos prestations", items: servicesFor(site.tradeType) };
    case "about":
      return {
        title: "À propos",
        body: `${site.businessName} met son savoir-faire de ${t} à votre service à ${area}. Chaque intervention est réalisée avec soin, dans les règles de l'art et dans les délais convenus. ${firstName(site.ownerName)} vous accompagne du devis à la fin du chantier.`,
      };
    case "zones":
      return { title: "Zones d'intervention", items: zonesFrom(site, area) };
    case "reviews":
      return { title: "Ce que disent nos clients", items: [] };
    case "hours":
      return {
        title: "Horaires",
        note: "Urgences possibles en dehors de ces horaires — appelez-nous.",
        days: DEFAULT_HOURS,
      };
    case "trust":
      return { title: "", items: DEFAULT_TRUST };
    case "cta":
      return {
        title: "Un projet en tête ? Parlons-en.",
        body: `Devis gratuit et réponse rapide. ${firstName(site.ownerName)} vous recontacte pour faire le point.`,
      };
    case "contact":
      return {
        title: "Parlons de votre projet",
        body: `Décrivez votre besoin, ${firstName(site.ownerName)} vous recontacte rapidement avec un devis.`,
      };
  }
}

/* -------------------------------- resolve -------------------------------- */

/** True when a section has enough content to be worth rendering publicly. */
function hasContent(key: SectionKey, c: Record<string, unknown>): boolean {
  if (key === "reviews") return ((c.items as unknown[]) ?? []).length > 0;
  return true;
}

export function resolveSiteConfig(
  site: PublicSite,
  area: string,
  plan: string | null | undefined,
  raw: unknown
): ResolvedSiteConfig {
  const stored: StoredSiteConfig =
    raw && typeof raw === "object" ? (raw as StoredSiteConfig) : {};

  const wanted = getTemplate(stored.template ?? site.templateId);
  const paid = isPremiumPlan(plan);
  const downgraded = wanted.tier === "premium" && !paid;
  const template = downgraded ? TEMPLATES[0] : wanted;

  const storedOrder = (stored.order ?? []).filter((k) =>
    MOVABLE_SECTIONS.includes(k as SectionKey)
  ) as SectionKey[];
  const hasConfig = storedOrder.length > 0 || (stored.disabled?.length ?? 0) > 0;

  // Full ordered list; disabled set. For sites with no stored config,
  // default to the (chosen) template's section set.
  const order: SectionKey[] = [
    ...storedOrder,
    ...MOVABLE_SECTIONS.filter((k) => !storedOrder.includes(k)),
  ];
  const disabled = new Set<SectionKey>(
    hasConfig
      ? ((stored.disabled ?? []) as SectionKey[])
      : MOVABLE_SECTIONS.filter((k) => !template.defaultOrder.includes(k))
  );

  const content = stored.content ?? {};

  const build = (key: SectionKey): ResolvedSection => {
    const base = defaultContent(key, site, area) as Record<string, unknown>;
    const over = (content[key] ?? {}) as Record<string, unknown>;
    const merged: Record<string, unknown> = { ...base };
    for (const [k, v] of Object.entries(over)) {
      if (v === undefined || v === null) continue;
      if (typeof v === "string" && v.trim() === "") continue;
      if (Array.isArray(v) && v.length === 0) continue;
      merged[k] = v;
    }
    return { key, content: merged as ResolvedSection["content"] };
  };

  const middle = order
    .filter((k) => {
      if (disabled.has(k)) return false;
      if (PREMIUM_SECTIONS.includes(k) && !paid) return false;
      return true;
    })
    .map(build)
    .filter((s) => hasContent(s.key, s.content as Record<string, unknown>));

  return {
    templateId: template.id,
    downgraded,
    premiumLocked: !paid,
    sections: [build("hero"), ...middle, build("contact")],
  };
}
