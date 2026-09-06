import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Check, CreditCard } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { withTenant } from "@/lib/db/tenant";
import { db } from "@/lib/db";
import { artisanProfiles, tenants } from "@/db/schema";
import { PLANS } from "@/lib/marketing/plans";
import { stripeBillingEnabled } from "@/lib/stripe/plans";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileForm } from "./profile-form";
import { PlanPicker } from "./plan-picker";
import { openBillingPortal } from "./actions/billing";
import { CheckoutToast } from "./checkout-toast";

export const metadata: Metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; checkout?: string }>;
}) {
  const { tenantId, plan, email } = await requireAuth();
  const { tab, checkout } = await searchParams;
  const [profile, user, tenantRow] = await Promise.all([
    withTenant(tenantId, (tx) =>
      tx.query.artisanProfiles.findFirst({
        where: eq(artisanProfiles.tenantId, tenantId),
      })
    ),
    getCurrentUser(),
    db
      .select({ customerId: tenants.stripeCustomerId })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1),
  ]);

  const currentPlan = PLANS.find((p) => p.id === plan) ?? PLANS[0];
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";
  const marketingUrl = `https://www.${rootDomain}`;
  const stripeOn = stripeBillingEnabled();
  const hasCustomer = Boolean(tenantRow[0]?.customerId);
  const onAbo = tab === "abonnement";

  return (
    <>
      <CheckoutToast status={checkout} />
      <PageHeader
        title="Paramètres"
        description="Profil professionnel, facturation et abonnement."
      />

      <Tabs defaultValue={onAbo ? "abonnement" : "profil"}>
        <TabsList>
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="abonnement">Abonnement</TabsTrigger>
          <TabsTrigger value="equipe">Équipe</TabsTrigger>
        </TabsList>

        <TabsContent value="profil">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Profil professionnel</CardTitle>
              <CardDescription>
                Ces informations apparaissent sur vos factures, vos e-mails et
                votre site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile ?? undefined} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abonnement">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Plan {currentPlan.name}
                {plan === "free" && <Badge variant="neutral">Gratuit</Badge>}
              </CardTitle>
              <CardDescription>{currentPlan.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="grid gap-2 sm:grid-cols-2">
                {currentPlan.highlights
                  .filter((h) => !h.endsWith(":"))
                  .map((h) => (
                    <li key={h} className="flex gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {h}
                    </li>
                  ))}
              </ul>

              {stripeOn && hasCustomer && (
                <form action={openBillingPortal}>
                  <Button type="submit" variant="outline" size="sm">
                    <CreditCard className="size-4" />
                    Gérer mon abonnement
                  </Button>
                </form>
              )}

              {plan !== "business" && (
                <div className="border-t border-border pt-6">
                  <p className="mb-4 text-sm font-medium text-foreground">
                    Changer de plan
                  </p>
                  <PlanPicker
                    currentPlan={plan}
                    marketingUrl={marketingUrl}
                    stripeEnabled={stripeOn}
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Une question sur votre abonnement ?{" "}
                <a href="mailto:aide@traballo.pro" className="text-primary hover:underline">
                  aide@traballo.pro
                </a>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipe">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Équipe</CardTitle>
              <CardDescription>
                Invitez un collaborateur à accéder au tableau de bord.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border p-4">
                <div className="text-sm font-medium text-foreground">
                  {profile?.ownerName ?? user?.name ?? "Vous"}
                </div>
                <div className="text-sm text-muted-foreground">{email}</div>
                <Badge variant="neutral" className="mt-2">
                  Propriétaire
                </Badge>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                L&apos;invitation de collaborateurs arrive bientôt.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
