/**
 * Update appointment status server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { getTenantId } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "confirmed" | "cancelled" | "completed"
) {
  try {
    await requireAuth();
    const tenantId = await getTenantId();

    if (!tenantId) {
      return { error: "Tenant context required" };
    }

    await db
      .update(appointments)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.tenantId, tenantId)
        )
      );

    revalidatePath(`/dashboard/appointments/${appointmentId}`);
    revalidatePath("/dashboard/appointments");

    return { success: true };
  } catch (error) {
    console.error("Update appointment status error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to update appointment",
    };
  }
}
