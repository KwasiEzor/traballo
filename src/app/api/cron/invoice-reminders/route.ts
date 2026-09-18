/**
 * Daily invoice reminder cron — TRB-056→060.
 *
 * 1. Flips any sent/viewed invoice past its due date to `overdue` (all
 *    plans — this is basic status hygiene, not the paid "relances" feature).
 * 2. Sends J+7 / J+30 reminder e-mails to the client, Pro+ tenants only,
 *    guarded by the `notification_deliveries` ledger so a re-run never
 *    double-sends.
 *
 * Runs cross-tenant, so it uses the owner `db` connection directly (like
 * the Stripe webhook) rather than `withTenant` — there is no per-request
 * tenant here.
 */
import { and, eq, inArray, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  invoices,
  clients,
  tenants,
  artisanProfiles,
  notificationDeliveries,
} from "@/db/schema";
import { isPremiumPlan } from "@/lib/artisan/templates";
import {
  daysLate,
  dueReminders,
  renderReminderTemplate,
  shouldMarkOverdue,
  DEFAULT_REMINDER_TEMPLATE,
  type ReminderMilestone,
} from "@/lib/invoices/reminders";
import { sendEmail } from "@/lib/email/send";
import { InvoiceReminderEmail } from "@/lib/email/templates/invoice-reminder-email";
import { createNotification } from "@/lib/notifications/create";
import { formatEUR } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REMINDERABLE_STATUSES = ["sent", "viewed", "overdue"] as const;
const BATCH_LIMIT = 500;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("CRON_SECRET non configuré.", { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Non autorisé.", { status: 401 });
  }

  const today = new Date();
  const rows = await db
    .select({
      invoiceId: invoices.id,
      tenantId: invoices.tenantId,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      dueDate: invoices.dueDate,
      total: invoices.total,
      pdfUrl: invoices.pdfUrl,
      reminderOverride: invoices.reminderOverride,
      clientName: clients.name,
      clientEmail: clients.email,
      plan: tenants.plan,
      artisanEmail: artisanProfiles.email,
      artisanBusinessName: artisanProfiles.businessName,
      invoiceReminderEnabled: artisanProfiles.invoiceReminderEnabled,
      invoiceReminderTemplate: artisanProfiles.invoiceReminderTemplate,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
    .innerJoin(artisanProfiles, eq(artisanProfiles.tenantId, invoices.tenantId))
    .where(
      and(
        inArray(invoices.status, REMINDERABLE_STATUSES),
        lte(invoices.dueDate, todayStr())
      )
    )
    .limit(BATCH_LIMIT);

  let markedOverdue = 0;
  let remindersSent = 0;
  let remindersFailed = 0;

  for (const row of rows) {
    try {
      if (shouldMarkOverdue(row.status, row.dueDate, today)) {
        await db
          .update(invoices)
          .set({ status: "overdue", updatedAt: new Date() })
          .where(eq(invoices.id, row.invoiceId));
        markedOverdue += 1;
        await createNotification({
          tenantId: row.tenantId,
          type: "invoices.overdue",
          title: `Facture ${row.invoiceNumber} en retard`,
          body: `${row.clientName} n'a toujours pas réglé cette facture.`,
          actionUrl: `/dashboard/invoices/${row.invoiceId}`,
        });
      }

      if (!isPremiumPlan(row.plan) || !row.invoiceReminderEnabled) continue;
      if (!row.clientEmail) continue;

      const alreadySent = await db
        .select({ kind: notificationDeliveries.kind })
        .from(notificationDeliveries)
        .where(
          and(
            eq(notificationDeliveries.entityType, "invoice"),
            eq(notificationDeliveries.entityId, row.invoiceId),
            eq(notificationDeliveries.channel, "email")
          )
        );

      const due = dueReminders(
        { status: row.status, dueDate: row.dueDate, reminderOverride: row.reminderOverride },
        today,
        alreadySent.map((d) => d.kind as ReminderMilestone)
      );
      if (due.length === 0) continue;

      const late = daysLate(row.dueDate, today);
      const body = renderReminderTemplate(
        row.invoiceReminderTemplate || DEFAULT_REMINDER_TEMPLATE,
        {
          client: row.clientName,
          number: row.invoiceNumber,
          amount: formatEUR(row.total),
          days: late,
          link: row.pdfUrl ?? "",
        }
      );

      for (const milestone of due) {
        const sent = await sendEmail({
          to: row.clientEmail,
          subject: `Rappel — facture ${row.invoiceNumber} de ${row.artisanBusinessName}`,
          react: InvoiceReminderEmail({
            invoiceNumber: row.invoiceNumber,
            clientName: row.clientName,
            total: formatEUR(row.total),
            dueDate: row.dueDate,
            artisanBusinessName: row.artisanBusinessName,
            body,
            pdfUrl: row.pdfUrl ?? undefined,
          }),
          replyTo: row.artisanEmail,
        });

        await db
          .insert(notificationDeliveries)
          .values({
            tenantId: row.tenantId,
            entityType: "invoice",
            entityId: row.invoiceId,
            kind: milestone,
            channel: "email",
            status: sent.error ? "failed" : "sent",
            detail: sent.error ?? null,
          })
          .onConflictDoNothing();

        if (sent.error) {
          remindersFailed += 1;
          continue;
        }
        remindersSent += 1;

        await createNotification({
          tenantId: row.tenantId,
          type: "invoices.reminder_sent",
          title: `Relance envoyée — facture ${row.invoiceNumber}`,
          body: `Rappel ${milestone === "j7" ? "J+7" : "J+30"} envoyé à ${row.clientName}.`,
          actionUrl: `/dashboard/invoices/${row.invoiceId}`,
        });
      }
    } catch (err) {
      console.error(`[cron/invoice-reminders] invoice ${row.invoiceId} failed:`, err);
      remindersFailed += 1;
    }
  }

  return Response.json({
    checked: rows.length,
    markedOverdue,
    remindersSent,
    remindersFailed,
  });
}
