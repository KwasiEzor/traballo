"use client";

import Link from "next/link";
import { Plus, ReceiptText, Users, CalendarDays } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const ACTIONS = [
  { label: "Nouvelle facture", href: "/dashboard/invoices/new", icon: ReceiptText },
  { label: "Nouveau client", href: "/dashboard/clients/new", icon: Users },
  { label: "Nouveau rendez-vous", href: "/dashboard/appointments/new", icon: CalendarDays },
];

export function CreateMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center justify-center gap-2 rounded-lg bg-sidebar-primary px-3 py-2 text-sm font-semibold text-sidebar-primary-foreground shadow-sm outline-none transition-[filter,transform] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-sidebar-ring active:scale-[0.98]">
        <Plus className="size-4" />
        Créer
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {ACTIONS.map((a) => (
          <DropdownMenuItem key={a.href} asChild onSelect={onNavigate}>
            <Link href={a.href}>
              <a.icon /> {a.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
