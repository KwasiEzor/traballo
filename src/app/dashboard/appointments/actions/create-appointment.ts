/**
 * Create appointment server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { appointments } from "@/db/schema";
import { parisWallTime } from "@/lib/time";
import { loadAppointmentNotice } from "@/lib/appointments/notify-data";
import { notifyClientOnce } from "@/lib/appointments/notify";
import { z } from "zod";

const createAppointmentSchema = z.object({
  clientId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(1, "Titre requis"),
  startDate: z.string().min(1, "Date requise"),
  startTime: z.string().min(1, "Heure de début requise"),
  endTime: z.string().min(1, "Heure de fin requise"),
  notes: z.string().optional(),
  /** Confirm the appointment and e-mail the client (if they have an address). */
  sendConfirmation: z.boolean().optional(),
});

export async function createAppointment(
  input: z.infer<typeof createAppointmentSchema>
) {
  try {
    const { tenantId } = await requireAuth();

    const validated = createAppointmentSchema.parse(input);

    // The artisan types Paris time; the server runs in UTC.
    const startDateTime = parisWallTime(validated.startDate, validated.startTime);
    const endDateTime = parisWallTime(validated.startDate, validated.endTime);

    // Validate end > start
    if (endDateTime <= startDateTime) {
      return { error: "L'heure de fin doit être après l'heure de début" };
    }

    const confirm = Boolean(validated.sendConfirmation && validated.clientId);

    const [created] = await withTenant(tenantId, (tx) =>
      tx
        .insert(appointments)
        .values({
          tenantId,
          clientId: validated.clientId || null,
          title: validated.title,
          startTime: startDateTime,
          endTime: endDateTime,
          notes: validated.notes || null,
          status: confirm ? "confirmed" : "pending",
        })
        .returning({ id: appointments.id })
    );

    let confirmation: string | null = null;
    if (confirm && created) {
      const notice = await withTenant(tenantId, (tx) =>
        loadAppointmentNotice(tx, created.id, tenantId)
      );
      if (notice) confirmation = await notifyClientOnce(notice, "confirmation");
    }

    revalidatePath("/dashboard/appointments");
    redirect(
      confirmation
        ? `/dashboard/appointments?confirmation=${confirmation}`
        : "/dashboard/appointments"
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("Create appointment error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to create appointment",
    };
  }
}
