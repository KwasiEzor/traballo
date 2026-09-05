import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { getArtisanProfile, hasCompletedOnboarding } from "@/lib/artisan/profile";
import { Logo } from "@/components/brand/logo";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Topbar } from "@/components/dashboard/topbar";
import { UpgradeButton } from "@/components/dashboard/upgrade-cta";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, plan } = await requireAuth();
  if (!(await hasCompletedOnboarding())) redirect("/onboarding");

  const [user, profile] = await Promise.all([
    getCurrentUser(),
    getArtisanProfile(),
  ]);

  const displayName = profile?.businessName || user?.name || "Mon compte";

  return (
    <div className="grid min-h-dvh lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link href="/dashboard" className="rounded-md">
            <Logo />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav />
        </div>
        <div className="space-y-3 border-t border-sidebar-border p-4">
          {plan !== "business" && (
            <div className="rounded-lg bg-sidebar-accent/50 p-3">
              <p className="text-xs font-medium text-sidebar-foreground">
                Plan {plan === "free" ? "Free" : "Pro"}
              </p>
              <p className="mt-0.5 text-[11px] text-sidebar-foreground/60">
                {plan === "free"
                  ? "Débloquez factures illimitées et rendez-vous."
                  : "Débloquez l'agent IA et WhatsApp Business."}
              </p>
              <UpgradeButton plan={plan} className="mt-2 w-full" />
            </div>
          )}
          <p className="text-xs text-sidebar-foreground/60">
            {profile?.businessName ?? "Traballo"}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <Topbar
          user={{
            name: displayName,
            email: email,
            plan: plan,
          }}
        />
        <main className="flex-1 bg-muted/30 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
