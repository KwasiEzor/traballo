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
import { z } from "zod";
import { loadAppointmentNotice } from "@/lib/appointments/notify-data";
import { notifyClientOnce, type ClientNoticeResult } from "@/lib/appointments/notify";

const inputSchema = z.object({
  appointmentId: z.uuid(),
  status: z.enum(["confirmed", "cancelled", "completed"]),
});

/**
 * Change an appointment's status. Confirming, or cancelling an upcoming
 * appointment, also e-mails the client (once — see `notifyClientOnce`);
 * `client` reports how that went.
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: "confirmed" | "cancelled" | "completed"
): Promise<{ success: true; client?: ClientNoticeResult } | { error: string }> {
  const parsed = inputSchema.safeParse({ appointmentId, status });
  if (!parsed.success) return { error: "Requête invalide." };

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

    let client: ClientNoticeResult | undefined;
    if (status === "confirmed" || status === "cancelled") {
      const notice = await withTenant(tenantId, (tx) =>
        loadAppointmentNotice(tx, appointmentId, tenantId)
      );
      if (notice && notice.startTime.getTime() > Date.now()) {
        client = await notifyClientOnce(
          notice,
          status === "confirmed" ? "confirmation" : "cancellation"
        );
      }
    }

    revalidatePath(`/dashboard/appointments/${appointmentId}`);
    revalidatePath("/dashboard/appointments");

    return client ? { success: true, client } : { success: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Update appointment status error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to update appointment",
    };
  }
}
