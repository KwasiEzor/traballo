/**
 * Create appointment server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getTenantId } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { appointments } from "@/db/schema";
import { z } from "zod";

const createAppointmentSchema = z.object({
  clientId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(1, "Titre requis"),
  startDate: z.string().min(1, "Date requise"),
  startTime: z.string().min(1, "Heure de début requise"),
  endTime: z.string().min(1, "Heure de fin requise"),
  notes: z.string().optional(),
});

export async function createAppointment(
  input: z.infer<typeof createAppointmentSchema>
) {
  try {
    await requireAuth();
    const tenantId = await getTenantId();

    if (!tenantId) {
      return { error: "Tenant context required" };
    }

    const validated = createAppointmentSchema.parse(input);

    // Combine date and time
    const startDateTime = new Date(
      `${validated.startDate}T${validated.startTime}`
    );
    const endDateTime = new Date(`${validated.startDate}T${validated.endTime}`);

    // Validate end > start
    if (endDateTime <= startDateTime) {
      return { error: "L'heure de fin doit être après l'heure de début" };
    }

    await db.insert(appointments).values({
      tenantId,
      clientId: validated.clientId || null,
      title: validated.title,
      startTime: startDateTime,
      endTime: endDateTime,
      notes: validated.notes || null,
      status: "pending",
    });

    revalidatePath("/dashboard/appointments");
    redirect("/dashboard/appointments");
  } catch (error) {
    console.error("Create appointment error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to create appointment",
    };
  }
}
