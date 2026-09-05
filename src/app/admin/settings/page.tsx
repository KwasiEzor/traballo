import type { Metadata } from "next";
import { requireAdminAccess } from "@/lib/auth/admin";
import { anthropicKeyStatus } from "@/lib/ai/settings";
import { PageHeader } from "@/components/dashboard/page-header";
import { AnthropicKeyForm } from "./settings-form";

export const metadata: Metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminAccess();
  const status = await anthropicKeyStatus();

  return (
    <>
      <PageHeader
        title="Paramètres"
        description="Configuration de la plateforme."
      />
      <div className="max-w-2xl">
        <AnthropicKeyForm source={status.source} hint={status.hint} />
      </div>
    </>
  );
}
