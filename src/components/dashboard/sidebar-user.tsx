"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOutAction } from "@/app/dashboard/actions";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "T"
  );
}

export function SidebarUser({ name, plan }: { name: string; plan: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/30 px-3 py-2.5">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-sidebar-foreground">
          {name}
        </p>
        <p className="text-[11px] capitalize text-sidebar-foreground/55">
          Plan {plan}
        </p>
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          aria-label="Se déconnecter"
          className="rounded-md p-1.5 text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}
