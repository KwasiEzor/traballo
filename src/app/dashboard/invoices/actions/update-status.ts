/**
 * Update invoice status server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { invoices } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function updateInvoiceStatus(
  invoiceId: string,
  status: "sent" | "paid" | "cancelled"
) {
  try {
    const { tenantId } = await requireAuth();

    const updates: Record<string, any> = { status };

    if (status === "sent") {
      updates.sentAt = new Date();
    } else if (status === "paid") {
      updates.paidAt = new Date();
    }

    await withTenant(tenantId, async (tx) => {
      await tx
        .update(invoices)
        .set(updates)
        .where(
          and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId))
        );
    });

    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/invoices");

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Update invoice status error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to update invoice",
    };
  }
}
