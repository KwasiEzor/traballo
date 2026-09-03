"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/brand/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { UserMenu } from "@/components/dashboard/user-menu";
import { dashboardTitle } from "@/lib/dashboard/nav";

export function Topbar({
  user,
}: {
  user: { name: string; email: string; plan: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [pathname]);

  return (
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

      <h1 className="font-display text-base font-semibold tracking-tight text-foreground">
        {dashboardTitle(pathname)}
      </h1>

      <div className="ml-auto flex items-center gap-1.5">
        {user.plan === "free" && (
          <Badge variant="neutral" className="hidden sm:inline-flex">
            Plan Free
          </Badge>
        )}
        <ThemeToggle />
        <UserMenu name={user.name} email={user.email} plan={user.plan} />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center border-b border-sidebar-border px-5">
            <Logo />
          </div>
          <div className="p-3">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
