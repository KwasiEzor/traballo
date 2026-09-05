"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function TenantFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = React.useState(sp.get("q") ?? "");

  const push = React.useCallback(
    (patch: Record<string, string>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, sp]
  );

  React.useEffect(() => {
    const t = setTimeout(() => {
      if ((sp.get("q") ?? "") !== q) push({ q });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nom, e-mail, sous-domaine…"
          className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-ring"
        />
      </div>

      <Select
        value={sp.get("plan") ?? "all"}
        onValueChange={(v) => push({ plan: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les plans</SelectItem>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="business">Business</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sp.get("status") ?? "all"}
        onValueChange={(v) => push({ status: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous statuts</SelectItem>
          <SelectItem value="active">Actif</SelectItem>
          <SelectItem value="suspended">Suspendu</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sp.get("sort") ?? "recent"}
        onValueChange={(v) => push({ sort: v === "recent" ? "" : v })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Tri" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Plus récents</SelectItem>
          <SelectItem value="oldest">Plus anciens</SelectItem>
          <SelectItem value="name">Nom (A-Z)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
