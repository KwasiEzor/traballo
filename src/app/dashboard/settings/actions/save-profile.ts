/**
 * Save artisan profile server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { artisanProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { geocodeAddress } from "@/lib/geo/geocode";

const profileSchema = z.object({
  businessName: z.string().min(1, "Nom d'entreprise requis"),
  ownerName: z.string().min(1, "Nom du gérant requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  address: z.string().optional(),
  vatNumber: z.string().optional(),
  iban: z.string().optional(),
  tradeType: z.string().optional(),
});

export async function saveProfile(input: z.infer<typeof profileSchema>) {
  try {
    const { tenantId } = await requireAuth();

    const validated = profileSchema.parse(input);

    const existing = await withTenant(tenantId, (tx) =>
      tx.query.artisanProfiles.findFirst({
        where: eq(artisanProfiles.tenantId, tenantId),
      })
    );

    // Keep the map in sync with the address: geocode when it changed, clear
    // the coordinates when the address is removed, leave them untouched if
    // geocoding fails transiently. Done outside the write transaction — it's
    // a network call.
    const addressChanged =
      (validated.address || null) !== (existing?.address ?? null);
    let geo: { latitude: number | null; longitude: number | null } | null = null;
    if (!validated.address) {
      geo = { latitude: null, longitude: null };
    } else if (addressChanged || existing?.latitude == null) {
      const coords = await geocodeAddress(validated.address);
      if (coords) geo = { latitude: coords.lat, longitude: coords.lng };
    }

    await withTenant(tenantId, async (tx) => {
      if (existing) {
        await tx
          .update(artisanProfiles)
          .set({
            ...validated,
            phone: validated.phone || null,
            whatsappNumber: validated.whatsappNumber || null,
            address: validated.address || null,
            vatNumber: validated.vatNumber || null,
            iban: validated.iban || null,
            tradeType: validated.tradeType || null,
            ...(geo ?? {}),
            updatedAt: new Date(),
          })
          .where(eq(artisanProfiles.id, existing.id));
      } else {
        await tx.insert(artisanProfiles).values({
          tenantId,
          ...validated,
          phone: validated.phone || null,
          whatsappNumber: validated.whatsappNumber || null,
          address: validated.address || null,
          vatNumber: validated.vatNumber || null,
          iban: validated.iban || null,
          tradeType: validated.tradeType || null,
          ...(geo ?? {}),
        });
      }
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Save profile error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to save profile",
    };
  }
}
