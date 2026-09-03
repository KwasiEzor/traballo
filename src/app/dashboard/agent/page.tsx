import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { aiAgentConfig } from "@/db/schema";
import { getArtisanProfile } from "@/lib/artisan/profile";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
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

  const quota =
    plan === "free" ? "50 messages / mois" : plan === "pro" ? "500 messages / mois" : "illimité";

  return (
    <>
      <PageHeader
        title="Agent IA"
        description={`Assistant conversationnel de votre site public · ${quota}`}
      />

      {plan === "free" && (
        <Alert variant="info" className="mb-6">
          <AlertContent>
            <AlertDescription>
              Le plan Free inclut 50 messages par mois. Passez à Pro pour un agent
              configurable avec 500 messages, ou Business pour un usage illimité.
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <AgentForm
        config={config ?? undefined}
        businessName={profile?.businessName ?? "votre entreprise"}
      />
    </>
  );
}
