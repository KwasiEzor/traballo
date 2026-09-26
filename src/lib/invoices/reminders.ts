/**
 * Payment-reminder schedule for overdue invoices (Phase 3a). Pure: the cron
 * job feeds it dates and the reminders already sent (the
 * `notification_deliveries` ledger).
 *
 * Dates are calendar days (`YYYY-MM-DD`) in Europe/Paris — the artisans'
 * business day, whatever the server's timezone.
 */
import { planAllows, type PlanGate } from "@/lib/notifications/types";

export const REMINDER_MILESTONES = [
  { days: 7, kind: "reminder_j7" },
  { days: 30, kind: "reminder_j30" },
] as const;

export type ReminderKind = (typeof REMINDER_MILESTONES)[number]["kind"];

const PARIS_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's date in Paris, `YYYY-MM-DD`. */
export function parisToday(now: Date = new Date()): string {
  return PARIS_DATE.format(now);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days between the due date and today (negative before it). */
export function daysOverdue(dueDate: string, today: string): number {
  return Math.round(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${dueDate}T00:00:00Z`)) /
      DAY_MS
  );
}

/**
 * The reminder to send today, if any: the latest milestone reached, unless
 * it (or a later one) was already sent. A missed J+7 is caught up; past
 * J+30 only the J+30 goes out — never two reminders at once.
 */
export function dueReminder(
  dueDate: string,
  today: string,
  sent: ReadonlySet<string>
): ReminderKind | null {
  const days = daysOverdue(dueDate, today);
  const reached = REMINDER_MILESTONES.filter((m) => days >= m.days);
  const latest = reached[reached.length - 1];
  if (!latest) return null;
  const later = REMINDER_MILESTONES.filter((m) => m.days >= latest.days);
  return later.some((m) => sent.has(m.kind)) ? null : latest.kind;
}

/** Automatic reminders are a Pro / Business feature. */
export function remindersIncluded(plan: PlanGate): boolean {
  return planAllows("invoices.reminder_sent", plan);
}

const PDF_DATA_URL = /^data:application\/pdf;base64,([A-Za-z0-9+/=]+)$/;

/**
 * The invoice PDF as an attachment. Invoices store it as a base64 data URL
 * for now (see STATE.md, "PDF en base64 dans la DB"); anything else yields
 * no attachment.
 */
export function pdfFromDataUrl(url: string | null): Buffer | null {
  const b64 = url ? PDF_DATA_URL.exec(url)?.[1] : undefined;
  return b64 ? Buffer.from(b64, "base64") : null;
}
