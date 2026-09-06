"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UpgradeButton } from "@/components/dashboard/upgrade-cta";
import { Logo } from "@/components/brand/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/dashboard/sidebar-content";
import { UserMenu } from "@/components/dashboard/user-menu";
import { dashboardTitle } from "@/lib/dashboard/nav";
import type { DashboardChrome } from "@/lib/dashboard/chrome";

export function Topbar({
  user,
  chrome,
}: {
  user: { name: string; email: string; plan: string };
  chrome: DashboardChrome;
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

      <h1 className="truncate font-display text-base font-semibold tracking-tight text-foreground">
        {dashboardTitle(pathname)}
      </h1>

      <div className="ml-auto flex items-center gap-1.5">
        {user.plan !== "business" && (
          <UpgradeButton
            plan={user.plan}
            variant="outline"
            className="hidden sm:inline-flex"
          />
        )}
        <ThemeToggle />
        <UserMenu name={user.name} email={user.email} plan={user.plan} />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-[17rem] flex-col bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
          </div>
          <div className="min-h-0 flex-1">
            <SidebarContent
              name={user.name}
              plan={user.plan}
              chrome={chrome}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
