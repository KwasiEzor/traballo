/**
 * Settings page - Artisan profile configuration
 */

import { requireAuth } from "@/lib/auth";
import { getTenantId } from "@/lib/auth/tenant";
import { getTenantDb } from "@/lib/db/tenant";
import { ProfileForm } from "./components/profile-form";

export default async function SettingsPage() {
  await requireAuth();
  const tenantId = await getTenantId();

  if (!tenantId) {
    return <div>Tenant not found</div>;
  }

  const tenantDb = getTenantDb(tenantId);
  const profile = await tenantDb.query.artisanProfiles.findFirst({
    where: (profiles, { eq }) => eq(profiles.tenantId, tenantId),
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Paramètres</h1>
      <div className="max-w-2xl rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Profil professionnel</h2>
        <p className="mb-6 text-sm text-gray-600">
          Ces informations apparaîtront sur vos factures et emails.
        </p>
        <ProfileForm profile={profile || undefined} />
      </div>
    </div>
  );
}
