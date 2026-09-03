import Link from "next/link";
import { requireAdminAccess } from "@/lib/auth/admin";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import { signOutAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminAccess();

  return (
    <div className="grid min-h-dvh lg:grid-cols-[15rem_1fr]">
      <aside className="hidden flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <Link href="/admin">
            <Logo />
          </Link>
          <Badge variant="warning">Admin</Badge>
        </div>
        <div className="flex-1 p-3">
          <AdminNav />
        </div>
        <form action={signOutAction} className="border-t border-sidebar-border p-3">
          <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
            <LogOut className="size-4" /> Déconnexion
          </Button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <span className="font-display text-sm font-semibold text-foreground">
            Console d&apos;administration
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </header>
        <main className="flex-1 bg-muted/30 p-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
