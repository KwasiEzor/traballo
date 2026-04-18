/**
 * Update appointment status server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "confirmed" | "cancelled" | "completed"
) {
  try {
    const { tenantId } = await requireAuth();

    await withTenant(tenantId, async (tx) => {
      await tx
        .update(appointments)
        .set({ status, updatedAt: new Date() })
        .where(
          and(
            eq(appointments.id, appointmentId),
            eq(appointments.tenantId, tenantId)
          )
        );
    });

    revalidatePath(`/dashboard/appointments/${appointmentId}`);
    revalidatePath("/dashboard/appointments");

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Update appointment status error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to update appointment",
    };
  }
}
