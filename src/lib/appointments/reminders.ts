/**
 * Pure appointment-reminder logic (TRB-095, adapted). A daily cron only —
 * see NOTIFICATIONS_PLAN.md Phase 4 note: Vercel Hobby caps crons at once a
 * day, so an hour-precision "1h before" reminder isn't achievable. Instead
 * this fires once for any upcoming appointment within a wide look-ahead
 * window, wide enough that a daily run never misses one.
 */

export type AppointmentReminderStatus = "pending" | "confirmed";

const REMINDERABLE_STATUSES = new Set<string>(["pending", "confirmed"]);

/** Hours ahead the daily cron looks — wide enough to cover any run time + a missed day. */
export const REMINDER_WINDOW_HOURS = 36;

/** Whether this appointment should get its one reminder e-mail right now. */
export function dueAppointmentReminder(
  appointment: { status: string; startTime: Date },
  now: Date
): boolean {
  if (!REMINDERABLE_STATUSES.has(appointment.status)) return false;
  const hoursUntil = (appointment.startTime.getTime() - now.getTime()) / (60 * 60 * 1000);
  return hoursUntil > 0 && hoursUntil <= REMINDER_WINDOW_HOURS;
}
