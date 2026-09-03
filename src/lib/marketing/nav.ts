/** Shared marketing navigation + brand constants. */

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.traballo.pro";

export const MARKETING_NAV = [
  { label: "Fonctionnalités", href: "/fonctionnalites" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_NAV = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "/fonctionnalites" },
      { label: "Tarifs", href: "/tarifs" },
      { label: "Facturation électronique", href: "/fonctionnalites#facturation" },
      { label: "Agent IA", href: "/fonctionnalites#agent-ia" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Contact", href: "/contact" },
      { label: "Se connecter", href: `${APP_URL}/auth/signin` },
      { label: "Créer un compte", href: `${APP_URL}/auth/signup` },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Conditions d'utilisation", href: "/cgu" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
] as const;
