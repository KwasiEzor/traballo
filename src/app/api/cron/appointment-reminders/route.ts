import { cronGuard } from "@/lib/cron";
import { runAppointmentReminders } from "@/lib/appointments/reminder-job";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily appointment reminders (Vercel Cron, see vercel.json): tomorrow's
 * appointments → reminder to the client, agenda to the artisan.
 */
export async function GET(request: Request): Promise<Response> {
  const denied = cronGuard(request);
  if (denied) return denied;

  try {
    const summary = await runAppointmentReminders();
    console.log("[cron] appointment-reminders", summary);
    return Response.json(summary);
  } catch (err) {
    console.error("[cron] appointment-reminders failed", err);
    return new Response("Échec du traitement.", { status: 500 });
  }
}
