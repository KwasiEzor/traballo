"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { invoices } from "@/db/schema";
import { err, errors, ok, type Result } from "@/lib/result";

const inputSchema = z.object({ invoiceId: z.uuid(), paused: z.boolean() });

/** Pause / resume the automatic reminders of one invoice. */
export async function setInvoiceRemindersPausedAction(
  invoiceId: unknown,
  paused: unknown
): Promise<Result<{ paused: boolean }>> {
  const parsed = inputSchema.safeParse({ invoiceId, paused });
  if (!parsed.success) return err(errors.validation(parsed.error.issues));
  const { invoiceId: id, paused: value } = parsed.data;

  try {
    const { tenantId } = await requireAuth();
    const rows = await withTenant(tenantId, (tx) =>
      tx
        .update(invoices)
        .set({ remindersPaused: value, updatedAt: new Date() })
        .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)))
        .returning({ id: invoices.id })
    );
    if (rows.length === 0) return err(errors.notFound("Facture"));

    revalidatePath(`/dashboard/invoices/${id}`);
    return ok({ paused: value });
  } catch (e) {
    console.error("setInvoiceRemindersPausedAction failed", e);
    return err({ code: "DB_ERROR", message: "Impossible d'enregistrer ce réglage" });
  }
}
