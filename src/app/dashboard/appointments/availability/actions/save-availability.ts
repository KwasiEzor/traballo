/**
 * Save availability server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { availability } from "@/db/schema";
import { eq } from "drizzle-orm";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export async function saveAvailability(slots: AvailabilitySlot[]) {
  try {
    const { tenantId } = await requireAuth();

    await withTenant(tenantId, async (tx) => {
      await tx.delete(availability).where(eq(availability.tenantId, tenantId));

      if (slots.length > 0) {
        await tx.insert(availability).values(
          slots.map((slot) => ({
            tenantId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }))
        );
      }
    });

    revalidatePath("/dashboard/appointments/availability");
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Save availability error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to save availability",
    };
  }
}
