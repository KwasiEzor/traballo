import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/auth/admin";
import { adminHome } from "@/lib/admin/nav";
import { getCurrentUser } from "@/lib/auth/session";
import { getArtisanProfile, hasCompletedOnboarding } from "@/lib/artisan/profile";
import { Logo } from "@/components/brand/logo";
import { BetaBadge } from "@/components/shared/beta-badge";
import { BetaBanner } from "@/components/shared/beta-banner";
import { SidebarContent } from "@/components/dashboard/sidebar-content";
import { Topbar } from "@/components/dashboard/topbar";
import { ImpersonationBanner } from "@/components/dashboard/impersonation-banner";
import { getDashboardChrome } from "@/lib/dashboard/chrome";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAuth();
  const { email, plan } = auth;

  // A super-admin who lands here (not impersonating) belongs in the console.
  if (isAdminEmail(email) && !auth.impersonating) {
    redirect(adminHome());
  }

  if (auth.status === "suspended" && !auth.impersonating) {
    return (
      <div className="grid min-h-dvh place-items-center bg-muted/30 p-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-display text-xl font-semibold text-foreground">
            Compte suspendu
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            L&apos;accès à votre tableau de bord est temporairement suspendu.
            Contactez-nous pour rétablir votre compte.
          </p>
          <a
            href="mailto:aide@traballo.pro"
            className="mt-5 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Contacter le support
          </a>
        </div>
      </div>
    );
  }

  if (!(await hasCompletedOnboarding())) redirect("/onboarding");

  const [user, profile, chrome] = await Promise.all([
    getCurrentUser(),
    getArtisanProfile(),
    getDashboardChrome(),
  ]);

  const displayName = profile?.businessName || user?.name || "Mon compte";

  return (
    <div className="grid min-h-dvh lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-5">
          <Link href="/dashboard" className="rounded-md">
            <Logo />
          </Link>
          <BetaBadge />
        </div>
        <div className="min-h-0 flex-1">
          <SidebarContent name={displayName} plan={plan} chrome={chrome} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {auth.impersonating && auth.impersonatedBy && (
          <ImpersonationBanner by={auth.impersonatedBy} />
        )}
        <Topbar
          user={{ name: displayName, email, plan }}
          chrome={chrome}
        />
        <BetaBanner />
        <main className="flex-1 bg-muted/30 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
