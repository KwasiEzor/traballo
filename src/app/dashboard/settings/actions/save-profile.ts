/**
 * Save artisan profile server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { artisanProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

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

    // Check if profile exists
    const existing = await db.query.artisanProfiles.findFirst({
      where: eq(artisanProfiles.tenantId, tenantId),
    });

    if (existing) {
      // Update
      await db
        .update(artisanProfiles)
        .set({
          ...validated,
          phone: validated.phone || null,
          whatsappNumber: validated.whatsappNumber || null,
          address: validated.address || null,
          vatNumber: validated.vatNumber || null,
          iban: validated.iban || null,
          tradeType: validated.tradeType || null,
          updatedAt: new Date(),
        })
        .where(eq(artisanProfiles.id, existing.id));
    } else {
      // Insert
      await db.insert(artisanProfiles).values({
        tenantId,
        ...validated,
        phone: validated.phone || null,
        whatsappNumber: validated.whatsappNumber || null,
        address: validated.address || null,
        vatNumber: validated.vatNumber || null,
        iban: validated.iban || null,
        tradeType: validated.tradeType || null,
      });
    }

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
