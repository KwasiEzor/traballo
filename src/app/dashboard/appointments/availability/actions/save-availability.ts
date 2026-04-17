/**
 * Save availability server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { getTenantId } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { availability } from "@/db/schema";
import { eq } from "drizzle-orm";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export async function saveAvailability(slots: AvailabilitySlot[]) {
  try {
    await requireAuth();
    const tenantId = await getTenantId();

    if (!tenantId) {
      return { error: "Tenant context required" };
    }

    // Delete existing availability for this tenant
    await db.delete(availability).where(eq(availability.tenantId, tenantId));

    // Insert new slots
    if (slots.length > 0) {
      await db.insert(availability).values(
        slots.map((slot) => ({
          tenantId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
      );
    }

    revalidatePath("/dashboard/appointments/availability");
    return { success: true };
  } catch (error) {
    console.error("Save availability error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to save availability",
    };
  }
}
