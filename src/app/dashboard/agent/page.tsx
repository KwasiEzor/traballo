import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Sparkles } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { aiAgentConfig } from "@/db/schema";
import { isBusinessPlan } from "@/lib/artisan/templates";
import { getArtisanProfile } from "@/lib/artisan/profile";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { AgentForm } from "./agent-form";

export const metadata: Metadata = { title: "Agent IA" };
export const dynamic = "force-dynamic";

export default async function AgentPage() {
  const { tenantId, plan } = await requireAuth();
  const [config, profile] = await Promise.all([
    withTenant(tenantId, (tx) =>
      tx.query.aiAgentConfig.findFirst({
        where: eq(aiAgentConfig.tenantId, tenantId),
      })
    ),
    getArtisanProfile(),
  ]);

  const business = isBusinessPlan(plan);

  return (
    <>
      <PageHeader
        title="Agent IA"
        description="Assistant conversationnel sur votre site public — réservé au plan Business."
      />

      {!business && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary-subtle p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                L&apos;agent IA fait partie du plan Business
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Vous pouvez le préparer dès maintenant : il s&apos;activera sur
                votre site dès le passage à Business.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/dashboard/settings#plan">Passer à Business</Link>
          </Button>
        </div>
      )}

      <AgentForm
        config={config ?? undefined}
        businessName={profile?.businessName ?? "votre entreprise"}
        locked={!business}
      />
    </>
  );
}
