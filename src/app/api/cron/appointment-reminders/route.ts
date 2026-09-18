/**
 * Daily appointment reminder cron (TRB-095, adapted for a daily-only Vercel
 * plan — see src/lib/appointments/reminders.ts). Pro+ only, matching the
 * "relances/rappels auto = Pro+" product decision (NOTIFICATIONS_PLAN.md
 * §"Décisions prises par défaut").
 *
 * Cross-tenant, so it uses the owner `db` connection directly, like the
 * invoice-reminders cron and the Stripe webhook.
 */
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  appointments,
  clients,
  tenants,
  artisanProfiles,
  notificationDeliveries,
} from "@/db/schema";
import { isPremiumPlan } from "@/lib/artisan/templates";
import { dueAppointmentReminder, REMINDER_WINDOW_HOURS } from "@/lib/appointments/reminders";
import { sendEmail } from "@/lib/email/send";
import { AppointmentReminderEmail } from "@/lib/email/templates/appointment-reminder-email";
import { createNotification } from "@/lib/notifications/create";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REMINDERABLE_STATUSES = ["pending", "confirmed"] as const;
const BATCH_LIMIT = 500;

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("CRON_SECRET non configuré.", { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Non autorisé.", { status: 401 });
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

  const rows = await db
    .select({
      appointmentId: appointments.id,
      tenantId: appointments.tenantId,
      title: appointments.title,
      status: appointments.status,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      clientName: clients.name,
      clientEmail: clients.email,
      plan: tenants.plan,
      artisanBusinessName: artisanProfiles.businessName,
    })
    .from(appointments)
    .innerJoin(clients, eq(appointments.clientId, clients.id))
    .innerJoin(tenants, eq(appointments.tenantId, tenants.id))
    .innerJoin(artisanProfiles, eq(artisanProfiles.tenantId, appointments.tenantId))
    .where(
      and(
        inArray(appointments.status, REMINDERABLE_STATUSES),
        gte(appointments.startTime, now),
        lte(appointments.startTime, windowEnd)
      )
    )
    .limit(BATCH_LIMIT);

  let remindersSent = 0;
  let remindersFailed = 0;

  for (const row of rows) {
    try {
      if (!isPremiumPlan(row.plan)) continue;
      if (!row.clientEmail) continue;
      if (!dueAppointmentReminder({ status: row.status, startTime: row.startTime }, now)) continue;

      const [already] = await db
        .select({ id: notificationDeliveries.id })
        .from(notificationDeliveries)
        .where(
          and(
            eq(notificationDeliveries.entityType, "appointment"),
            eq(notificationDeliveries.entityId, row.appointmentId),
            eq(notificationDeliveries.kind, "reminder"),
            eq(notificationDeliveries.channel, "email")
          )
        )
        .limit(1);
      if (already) continue;

      const sent = await sendEmail({
        to: row.clientEmail,
        subject: `Rappel — rendez-vous avec ${row.artisanBusinessName}`,
        react: AppointmentReminderEmail({
          clientName: row.clientName,
          title: row.title,
          startTime: row.startTime.toISOString(),
          endTime: row.endTime.toISOString(),
          artisanBusinessName: row.artisanBusinessName,
        }),
      });

      await db
        .insert(notificationDeliveries)
        .values({
          tenantId: row.tenantId,
          entityType: "appointment",
          entityId: row.appointmentId,
          kind: "reminder",
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
        type: "appointments.reminder",
        title: `Rappel envoyé — ${row.title}`,
        body: `Rappel envoyé à ${row.clientName} pour le rendez-vous.`,
        actionUrl: `/dashboard/appointments/${row.appointmentId}`,
      });
    } catch (err) {
      console.error(`[cron/appointment-reminders] appointment ${row.appointmentId} failed:`, err);
      remindersFailed += 1;
    }
  }

  return Response.json({ checked: rows.length, remindersSent, remindersFailed });
}
