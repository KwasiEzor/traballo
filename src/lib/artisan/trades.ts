/** Trade categories used across onboarding, the public site and the AI agent. */

export const TRADES = [
  { value: "plombier", label: "Plomberie / chauffage" },
  { value: "electricien", label: "Électricité" },
  { value: "menuisier", label: "Menuiserie" },
  { value: "macon", label: "Maçonnerie / gros œuvre" },
  { value: "peintre", label: "Peinture / revêtements" },
  { value: "carreleur", label: "Carrelage" },
  { value: "couvreur", label: "Couverture / toiture" },
  { value: "serrurier", label: "Serrurerie / métallerie" },
  { value: "jardinier", label: "Jardinage / paysagisme" },
  { value: "nettoyage", label: "Nettoyage / entretien" },
  { value: "demenagement", label: "Déménagement" },
  { value: "reparation", label: "Réparation électroménager" },
  { value: "autre", label: "Autre métier" },
] as const;

export type TradeValue = (typeof TRADES)[number]["value"];

export function tradeLabel(value: string | null | undefined) {
  return TRADES.find((t) => t.value === value)?.label ?? "Artisan";
}

/** Brand colour presets (OKLCH-friendly hex) offered during onboarding. */
export const BRAND_COLORS = [
  { name: "Azur", value: "#1f5fc4" },
  { name: "Bleu nuit", value: "#1e3a5f" },
  { name: "Émeraude", value: "#0f7a5a" },
  { name: "Ardoise", value: "#3f4756" },
  { name: "Brique", value: "#b4442e" },
  { name: "Ambre", value: "#c07a1e" },
  { name: "Prune", value: "#6b3f7a" },
  { name: "Anthracite", value: "#1f2430" },
] as const;
