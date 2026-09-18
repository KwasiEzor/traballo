"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { artisanProfiles } from "@/db/schema";

const schema = z.object({
  invoiceReminderEnabled: z.boolean(),
  invoiceReminderTemplate: z.string().trim().max(4000).optional(),
});

export async function saveInvoiceReminderSettings(
  input: z.infer<typeof schema>
): Promise<{ error?: string }> {
  const { tenantId } = await requireAuth();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Réglages invalides." };
  const { invoiceReminderEnabled, invoiceReminderTemplate } = parsed.data;

  try {
    await withTenant(tenantId, (tx) =>
      tx
        .update(artisanProfiles)
        .set({
          invoiceReminderEnabled,
          invoiceReminderTemplate: invoiceReminderTemplate || null,
          updatedAt: new Date(),
        })
        .where(eq(artisanProfiles.tenantId, tenantId))
    );
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Impossible d'enregistrer les réglages de relance." };
  }
  revalidatePath("/dashboard/settings");
  return {};
}
