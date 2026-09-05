/**
 * Site templates + section system for the public artisan vitrine.
 *
 * A template is a *style preset* (typography, spacing, hero treatment,
 * colour usage) applied to a shared set of section components. The section
 * order / on-off state / text overrides live in `sites.sections` (jsonb).
 */

export type SectionKey =
  | "hero"
  | "services"
  | "about"
  | "zones"
  | "reviews"
  | "hours"
  | "trust"
  | "cta"
  | "contact";

/** Sections the artisan can turn off or reorder. hero + contact are locked. */
export const MOVABLE_SECTIONS: SectionKey[] = [
  "services",
  "about",
  "zones",
  "reviews",
  "hours",
  "trust",
  "cta",
];

/** Sections that need a paid plan to appear on the public site. */
export const PREMIUM_SECTIONS: SectionKey[] = ["reviews", "hours"];

export const SECTION_META: Record<
  SectionKey,
  { label: string; hint: string; locked?: boolean; premium?: boolean }
> = {
  hero: { label: "En-tête", hint: "Titre, accroche, boutons.", locked: true },
  services: { label: "Prestations", hint: "Ce que vous proposez." },
  about: { label: "À propos", hint: "Votre approche, votre histoire." },
  zones: { label: "Zones d'intervention", hint: "Villes et secteurs couverts." },
  reviews: {
    label: "Avis clients",
    hint: "Témoignages que vous saisissez.",
    premium: true,
  },
  hours: { label: "Horaires", hint: "Vos jours et heures d'ouverture.", premium: true },
  trust: { label: "Réassurance", hint: "Trois points de confiance." },
  cta: { label: "Appel à l'action", hint: "Bandeau « demander un devis »." },
  contact: { label: "Contact", hint: "Formulaire et coordonnées.", locked: true },
};

export type TemplateId = "standard" | "epure" | "signature";

export interface TemplateDef {
  id: TemplateId;
  name: string;
  description: string;
  tier: "free" | "premium";
  /** Sections shown by default, in order (excluding the locked hero/contact). */
  defaultOrder: SectionKey[];
  /** Visual knobs consumed by the section components. */
  style: {
    /** Hero background: photo behind a dark scrim, or a flat brand wash. */
    hero: "photo" | "wash";
    /** Heading weight. */
    display: "bold" | "medium";
    /** Section vertical rhythm. */
    density: "airy" | "regular";
    /** Card / divider treatment. */
    surface: "card" | "line";
    /** Dark-sectioned accents (cta, trust) vs light throughout. */
    contrast: "high" | "soft";
  };
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "standard",
    name: "Standard",
    description: "Photo de métier en grand, cartes arrondies, chaleureux et direct.",
    tier: "free",
    defaultOrder: ["services", "trust", "cta"],
    style: {
      hero: "photo",
      display: "bold",
      density: "regular",
      surface: "card",
      contrast: "high",
    },
  },
  {
    id: "epure",
    name: "Épuré",
    description: "Typographie large, beaucoup de blanc, filets fins. Sobre et élégant.",
    tier: "free",
    defaultOrder: ["services", "about", "zones"],
    style: {
      hero: "wash",
      display: "medium",
      density: "airy",
      surface: "line",
      contrast: "soft",
    },
  },
  {
    id: "signature",
    name: "Signature",
    description:
      "Sections sombres, imagerie forte, avis clients et horaires mis en avant.",
    tier: "premium",
    defaultOrder: ["services", "about", "reviews", "hours", "zones", "trust", "cta"],
    style: {
      hero: "photo",
      display: "bold",
      density: "regular",
      surface: "card",
      contrast: "high",
    },
  },
];

export function getTemplate(id: string | null | undefined): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function isPremiumPlan(plan: string | null | undefined) {
  return plan === "pro" || plan === "business";
}
