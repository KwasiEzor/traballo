"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Settings, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Artisans", href: "/admin/tenants", icon: Building2 },
  { label: "Historique", href: "/admin/audit", icon: ScrollText },
  { label: "Paramètres", href: "/admin/settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
        Console
      </p>
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon
              className={cn(
                "size-[18px] shrink-0",
                active ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
