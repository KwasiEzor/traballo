"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { artisanProfiles } from "@/db/schema";
import { err, errors, ok, type Result } from "@/lib/result";

/** Turn the automatic invoice reminders (J+7 / J+30) on or off. */
export async function saveInvoiceRemindersAction(
  input: unknown
): Promise<Result<{ enabled: boolean }>> {
  const parsed = z.boolean().safeParse(input);
  if (!parsed.success) return err(errors.validation(parsed.error.issues));

  try {
    const { tenantId, impersonating } = await requireAuth();
    if (impersonating) {
      return err({
        code: "FORBIDDEN",
        message: "Action indisponible en mode support.",
      });
    }

    const rows = await withTenant(tenantId, (tx) =>
      tx
        .update(artisanProfiles)
        .set({ invoiceReminders: parsed.data, updatedAt: new Date() })
        .where(eq(artisanProfiles.tenantId, tenantId))
        .returning({ id: artisanProfiles.id })
    );
    if (rows.length === 0) return err(errors.notFound("Profil"));

    revalidatePath("/dashboard/settings");
    return ok({ enabled: parsed.data });
  } catch (e) {
    console.error("saveInvoiceRemindersAction failed", e);
    return err({
      code: "DB_ERROR",
      message: "Impossible d'enregistrer ce réglage",
    });
  }
}
