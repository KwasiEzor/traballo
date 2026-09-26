import { claimDelivery } from "@/lib/notifications/ledger";
import { createNotification } from "@/lib/notifications/create";
import { planAllows } from "@/lib/notifications/types";
import { addDays, parisDate, parisDayBounds, parisTime } from "@/lib/time";
import { findAppointmentsBetween, type AppointmentNotice } from "./notify-data";
import { notifyClientOnce } from "./notify";

export type AppointmentRunSummary = {
  day: string;
  appointments: number;
  clientReminders: number;
  clientFailed: number;
  agendas: number;
};

/**
 * Daily appointment job (cron, Phase 4), run in the evening: for tomorrow's
 * appointments (Paris day), remind each client by e-mail and send each
 * artisan one agenda of their day (in-app + e-mail per their preferences).
 * Pro / Business only. Each notice goes out once (ledger), so a re-run the
 * same day sends nothing twice.
 */
export async function runAppointmentReminders(
  now: Date = new Date()
): Promise<AppointmentRunSummary> {
  const day = addDays(parisDate(now), 1);
  const { start, end } = parisDayBounds(day);
  const rows = (await findAppointmentsBetween(start, end)).filter((a) =>
    planAllows("appointments.reminder", a.plan)
  );
  const summary: AppointmentRunSummary = {
    day,
    appointments: rows.length,
    clientReminders: 0,
    clientFailed: 0,
    agendas: 0,
  };

  for (const a of rows) {
    const result = await notifyClientOnce(a, "reminder");
    if (result === "sent") summary.clientReminders++;
    else if (result === "failed") summary.clientFailed++;
  }

  const byTenant = new Map<string, AppointmentNotice[]>();
  for (const a of rows) {
    byTenant.set(a.tenantId, [...(byTenant.get(a.tenantId) ?? []), a]);
  }
  for (const [tenantId, list] of byTenant) {
    try {
      if (await sendAgenda(tenantId, day, list)) summary.agendas++;
    } catch (err) {
      console.error(`[appointment-reminders] agenda ${tenantId} failed`, err);
    }
  }

  return summary;
}

async function sendAgenda(
  tenantId: string,
  day: string,
  appointments: AppointmentNotice[]
): Promise<boolean> {
  const claimed = await claimDelivery({
    tenantId,
    entityType: "tenant",
    entityId: tenantId,
    kind: `agenda:${day}`,
    channel: "in_app",
  });
  if (!claimed) return false;

  const n = appointments.length;
  const lines = appointments.map(
    (a) =>
      `${parisTime(a.startTime)} ${a.title}${a.clientName ? ` (${a.clientName})` : ""}`
  );
  await createNotification({
    tenantId,
    type: "appointments.reminder",
    title: `Demain : ${n} rendez-vous`,
    body: lines.join(" · "),
    actionUrl: "/dashboard/appointments",
    email: { subject: `Vos rendez-vous de demain (${n})`, cta: "Voir mes rendez-vous" },
  });
  return true;
}
