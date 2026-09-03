import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ReceiptText,
  Users,
  CalendarDays,
  Globe,
  Sparkles,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const DASHBOARD_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Factures", href: "/dashboard/invoices", icon: ReceiptText },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Rendez-vous", href: "/dashboard/appointments", icon: CalendarDays },
  { label: "Mon site", href: "/dashboard/site", icon: Globe },
  { label: "Agent IA", href: "/dashboard/agent", icon: Sparkles },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

/** Human title for a dashboard pathname (used by the top bar). */
export function dashboardTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/dashboard": "Tableau de bord",
    "/dashboard/invoices": "Factures",
    "/dashboard/invoices/new": "Nouvelle facture",
    "/dashboard/clients": "Clients",
    "/dashboard/clients/new": "Nouveau client",
    "/dashboard/appointments": "Rendez-vous",
    "/dashboard/appointments/new": "Nouveau rendez-vous",
    "/dashboard/appointments/availability": "Disponibilités",
    "/dashboard/site": "Mon site",
    "/dashboard/agent": "Agent IA",
    "/dashboard/settings": "Paramètres",
  };
  if (map[pathname]) return map[pathname];
  const match = DASHBOARD_NAV.filter((n) => !n.exact).find((n) =>
    pathname.startsWith(n.href)
  );
  return match?.label ?? "Tableau de bord";
}
