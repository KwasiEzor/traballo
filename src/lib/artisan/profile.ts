/**
 * src/lib/artisan/profile.ts
 * Helpers around the artisan profile — used to gate the dashboard behind
 * onboarding completion.
 */

import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { artisanProfiles, sites } from "@/db/schema";
import { requireAuth } from "@/lib/auth/require-auth";

export const getArtisanProfile = cache(async function getArtisanProfile() {
  const { tenantId } = await requireAuth();
  return db.query.artisanProfiles.findFirst({
    where: eq(artisanProfiles.tenantId, tenantId),
  });
});

export const getSite = cache(async function getSite() {
  const { tenantId } = await requireAuth();
  return db.query.sites.findFirst({
    where: eq(sites.tenantId, tenantId),
  });
});

/** True once the minimum onboarding fields are present. */
export async function hasCompletedOnboarding() {
  const profile = await getArtisanProfile();
  return Boolean(
    profile?.businessName && profile?.ownerName && profile?.tradeType && profile?.phone
  );
}
