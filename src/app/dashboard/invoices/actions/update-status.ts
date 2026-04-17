/**
 * Update invoice status server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { getTenantId } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { invoices } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function updateInvoiceStatus(
  invoiceId: string,
  status: "sent" | "paid" | "cancelled"
) {
  try {
    await requireAuth();
    const tenantId = await getTenantId();

    if (!tenantId) {
      return { error: "Tenant context required" };
    }

    const updates: Record<string, any> = { status };

    if (status === "sent") {
      updates.sentAt = new Date();
    } else if (status === "paid") {
      updates.paidAt = new Date();
    }

    await db
      .update(invoices)
      .set(updates)
      .where(
        and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId))
      );

    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/invoices");

    return { success: true };
  } catch (error) {
    console.error("Update invoice status error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to update invoice",
    };
  }
}
