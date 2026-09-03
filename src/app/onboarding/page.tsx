import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { hasCompletedOnboarding } from "@/lib/artisan/profile";
import { Logo } from "@/components/brand/logo";
import { OnboardingWizard } from "./onboarding-wizard";

export const metadata: Metadata = { title: "Bienvenue" };

export default async function OnboardingPage() {
  const { userId } = await requireAuth();

  if (await hasCompletedOnboarding()) {
    redirect("/dashboard");
  }

  const me = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { fullName: true },
  });

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <OnboardingWizard businessName={me?.fullName ?? "Votre entreprise"} />
      </main>
    </div>
  );
}
