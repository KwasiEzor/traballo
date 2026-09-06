"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { AdminNav } from "@/components/admin/admin-nav";
import { signOutAction } from "@/app/dashboard/actions";

function pageTitle(pathname: string): string {
  if (pathname === "/admin") return "Vue d'ensemble";
  if (pathname.startsWith("/admin/tenants")) return "Artisans";
  if (pathname.startsWith("/admin/audit")) return "Historique";
  if (pathname.startsWith("/admin/settings")) return "Paramètres";
  return "Console d'administration";
}

function UserBlock({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-sidebar-accent/40 p-2.5">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-primary text-xs text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-sidebar-foreground">
          {email}
        </div>
        <div className="text-[11px] text-sidebar-foreground/60">
          Super-administrateur
        </div>
      </div>
      <form action={signOutAction}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Se déconnecter"
          title="Se déconnecter"
          className="size-8 text-sidebar-foreground/70 hover:text-destructive"
        >
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar — sticky, self-contained scroll, pinned footer */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <Link href="/admin" className="rounded-md">
            <Logo />
          </Link>
          <Badge variant="warning">Admin</Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <AdminNav />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <UserBlock email={email} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Topbar — always visible; carries the mobile menu + sign-out */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="flex items-center gap-2">
            <ShieldCheck className="hidden size-4 text-warning sm:block" />
            <h1 className="font-display text-base font-semibold tracking-tight text-foreground">
              {pageTitle(pathname)}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="hidden max-w-[14rem] truncate text-xs text-muted-foreground sm:block">
              {email}
            </span>
            <ThemeToggle />
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                aria-label="Se déconnecter"
                className="text-muted-foreground hover:border-destructive/40 hover:text-destructive"
              >
                <LogOut className="size-4" />
                <span className="hidden md:inline">Déconnexion</span>
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 bg-muted/30 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
            <Logo />
            <Badge variant="warning">Admin</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <AdminNav />
          </div>
          <div className="border-t border-sidebar-border p-3">
            <UserBlock email={email} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
