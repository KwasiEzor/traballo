import { cronGuard } from "@/lib/cron";
import { runInvoiceReminders } from "@/lib/invoices/reminder-job";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily invoice reminders (Vercel Cron, see vercel.json). */
export async function GET(request: Request): Promise<Response> {
  const denied = cronGuard(request);
  if (denied) return denied;

  try {
    const summary = await runInvoiceReminders();
    console.log("[cron] invoice-reminders", summary);
    return Response.json(summary);
  } catch (err) {
    console.error("[cron] invoice-reminders failed", err);
    return new Response("Échec du traitement.", { status: 500 });
  }
}
