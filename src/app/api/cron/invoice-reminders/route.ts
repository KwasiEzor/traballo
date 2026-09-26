import { timingSafeEqual } from "node:crypto";
import { runInvoiceReminders } from "@/lib/invoices/reminder-job";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(header: string | null, secret: string): boolean {
  const got = Buffer.from(header ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

/**
 * Daily invoice reminders (Vercel Cron, see vercel.json). Vercel sends
 * `Authorization: Bearer $CRON_SECRET`; without the secret configured the
 * route stays closed.
 */
export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("Cron non configuré.", { status: 503 });
  if (!authorized(request.headers.get("authorization"), secret)) {
    return new Response("Non autorisé.", { status: 401 });
  }

  try {
    const summary = await runInvoiceReminders();
    console.log("[cron] invoice-reminders", summary);
    return Response.json(summary);
  } catch (err) {
    console.error("[cron] invoice-reminders failed", err);
    return new Response("Échec du traitement.", { status: 500 });
  }
}
