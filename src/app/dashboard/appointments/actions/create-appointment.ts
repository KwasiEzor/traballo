/**
 * Create appointment server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { appointments } from "@/db/schema";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send";
import { AppointmentConfirmationEmail } from "@/lib/email/templates/appointment-confirmation-email";

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
    const { tenantId } = await requireAuth();

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

    // Best-effort client confirmation e-mail — a failure here must not
    // block the appointment from being created.
    const confirmation = await withTenant(tenantId, async (tx) => {
      await tx.insert(appointments).values({
        tenantId,
        clientId: validated.clientId || null,
        title: validated.title,
        startTime: startDateTime,
        endTime: endDateTime,
        notes: validated.notes || null,
        status: "pending",
      });

      if (!validated.clientId) return null;
      const [client, profile] = await Promise.all([
        tx.query.clients.findFirst({
          where: (c, { eq }) => eq(c.id, validated.clientId as string),
        }),
        tx.query.artisanProfiles.findFirst({
          where: (p, { eq }) => eq(p.tenantId, tenantId),
        }),
      ]);
      if (!client?.email || !profile) return null;
      return { client, profile };
    });

    if (confirmation) {
      await sendEmail({
        to: confirmation.client.email!,
        subject: `Rendez-vous confirmé avec ${confirmation.profile.businessName}`,
        react: AppointmentConfirmationEmail({
          clientName: confirmation.client.name,
          title: validated.title,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          artisanBusinessName: confirmation.profile.businessName,
        }),
        replyTo: confirmation.profile.email,
      }).catch((err) => console.error("Appointment confirmation email failed:", err));
    }

    revalidatePath("/dashboard/appointments");
    redirect("/dashboard/appointments");
  } catch (error) {
    unstable_rethrow(error);
    console.error("Create appointment error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to create appointment",
    };
  }
}
