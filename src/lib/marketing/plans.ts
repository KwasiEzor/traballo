export type PlanId = "free" | "pro" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number; // per month, billed yearly
  cta: string;
  featured?: boolean;
  highlights: string[];
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Pour se lancer et être visible en ligne.",
    priceMonthly: 0,
    priceYearly: 0,
    cta: "Créer mon compte",
    highlights: [
      "Site web 1 page à votre métier",
      "Sous-domaine votre-nom.traballo.pro",
      "10 factures / mois (PDF)",
      "Carnet de clients illimité",
      "Boutons d'appel et WhatsApp flottants",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Le plan complet pour gérer toute l'activité.",
    priceMonthly: 29,
    priceYearly: 24,
    cta: "Essayer Pro",
    featured: true,
    highlights: [
      "Tout le plan Free, plus :",
      "Domaine personnalisé (1)",
      "Factures illimitées + Factur-X / PEPPOL",
      "Relances de paiement automatiques",
      "Rendez-vous en ligne + rappels e-mail",
      "Galerie photos, synchro Google Agenda",
      "Sans marque Traballo",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Pour les artisans et petites équipes qui grandissent.",
    priceMonthly: 49,
    priceYearly: 39,
    cta: "Passer à Business",
    highlights: [
      "Tout le plan Pro, plus :",
      "Agent IA sur votre site (illimité)",
      "WhatsApp Business + IA sur WhatsApp",
      "Rappels de RDV par SMS (100 / mois)",
      "Analytics des visiteurs du site",
      "2 domaines personnalisés",
      "Inbox unifiée site + WhatsApp",
      "Support prioritaire (< 24 h)",
    ],
  },
];

export interface FeatureRow {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  business: string | boolean;
}

export interface FeatureGroup {
  title: string;
  rows: FeatureRow[];
}

export const FEATURE_MATRIX: FeatureGroup[] = [
  {
    title: "Site web",
    rows: [
      { label: "Site vitrine à template métier", free: true, pro: true, business: true },
      { label: "Sous-domaine .traballo.pro", free: true, pro: true, business: true },
      { label: "Domaine personnalisé", free: false, pro: "1 domaine", business: "2 domaines" },
      { label: "Galerie photos", free: false, pro: "20 images", business: "Illimité" },
      { label: "Marque « Créé avec Traballo »", free: "Affichée", pro: "Retirée", business: "Retirée" },
      { label: "Analytics visiteurs", free: false, pro: false, business: true },
    ],
  },
  {
    title: "Facturation",
    rows: [
      { label: "Factures & devis", free: "10 / mois", pro: "Illimité", business: "Illimité" },
      { label: "Conformité Factur-X / PEPPOL", free: false, pro: true, business: true },
      { label: "Relances de paiement automatiques", free: false, pro: true, business: true },
      { label: "Export comptable", free: "CSV", pro: "CSV + FEC", business: "Complet" },
    ],
  },
  {
    title: "Rendez-vous",
    rows: [
      { label: "Prise de RDV en ligne", free: false, pro: true, business: true },
      { label: "Rappels automatiques", free: false, pro: "E-mail", business: "E-mail + SMS" },
      { label: "Synchro Google Agenda", free: false, pro: true, business: true },
    ],
  },
  {
    title: "Agent IA & messagerie",
    rows: [
      { label: "Agent IA sur le site (chatbot)", free: false, pro: false, business: "Illimité" },
      { label: "Boutons d'appel / WhatsApp flottants", free: true, pro: true, business: true },
      { label: "WhatsApp Business + IA", free: false, pro: false, business: true },
      { label: "Inbox unifiée", free: false, pro: false, business: true },
    ],
  },
  {
    title: "Support",
    rows: [
      { label: "Aide", free: "Communauté", pro: "E-mail < 48 h", business: "Prioritaire < 24 h" },
      { label: "Accès bêta aux nouveautés", free: false, pro: false, business: true },
    ],
  },
];
