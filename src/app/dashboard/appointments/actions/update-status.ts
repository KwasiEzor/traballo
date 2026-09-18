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
import { sendEmail } from "@/lib/email/send";
import { AppointmentCancelledEmail } from "@/lib/email/templates/appointment-cancelled-email";

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "confirmed" | "cancelled" | "completed"
) {
  try {
    const { tenantId } = await requireAuth();

    // Best-effort client cancellation e-mail — a failure here must not
    // block the status update. Only "cancelled" tells the client anything
    // new; "confirmed"/"completed" are the artisan's own bookkeeping.
    const cancellation =
      status === "cancelled"
        ? await withTenant(tenantId, async (tx) => {
            const appointment = await tx.query.appointments.findFirst({
              where: (a, { eq: eqA, and: andA }) =>
                andA(eqA(a.id, appointmentId), eqA(a.tenantId, tenantId)),
              with: { client: true },
            });
            if (!appointment?.client?.email) return null;
            const profile = await tx.query.artisanProfiles.findFirst({
              where: (p, { eq: eqP }) => eqP(p.tenantId, tenantId),
            });
            if (!profile) return null;
            return { appointment, client: appointment.client, profile };
          })
        : null;

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

    if (cancellation) {
      await sendEmail({
        to: cancellation.client.email!,
        subject: `Rendez-vous annulé — ${cancellation.profile.businessName}`,
        react: AppointmentCancelledEmail({
          clientName: cancellation.client.name,
          title: cancellation.appointment.title,
          startTime: cancellation.appointment.startTime.toISOString(),
          endTime: cancellation.appointment.endTime.toISOString(),
          artisanBusinessName: cancellation.profile.businessName,
          artisanEmail: cancellation.profile.email,
        }),
        replyTo: cancellation.profile.email,
      }).catch((err) => console.error("Appointment cancellation email failed:", err));
    }

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
