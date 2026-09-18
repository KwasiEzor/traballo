"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { invoices } from "@/db/schema";

export async function updateInvoiceReminderOverride(
  invoiceId: string,
  enabled: boolean
): Promise<{ error?: string }> {
  const { tenantId } = await requireAuth();
  try {
    await withTenant(tenantId, (tx) =>
      tx
        .update(invoices)
        .set({ reminderOverride: enabled ? "default" : "off", updatedAt: new Date() })
        .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)))
    );
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Impossible de mettre à jour les relances de cette facture." };
  }
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return {};
}
