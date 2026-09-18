/**
 * Pure invoice-reminder logic (TRB-056→060). No DB, no I/O — the cron route
 * and the manual-send action both wrap these.
 */

export type ReminderMilestone = "j7" | "j30";
export type ReminderableStatus = "sent" | "viewed" | "overdue";

const MILESTONES: { kind: ReminderMilestone; days: number }[] = [
  { kind: "j7", days: 7 },
  { kind: "j30", days: 30 },
];

const REMINDERABLE_STATUSES = new Set<string>(["sent", "viewed", "overdue"]);

/** Whole days between `dueDate` (a plain "YYYY-MM-DD") and `today`. Negative = not due yet. */
export function daysLate(dueDate: string, today: Date): number {
  const [y, m, d] = dueDate.split("-").map(Number);
  const due = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.floor((now - due) / (24 * 60 * 60 * 1000));
}

/**
 * Which J+7 / J+30 milestones are due for this invoice today and haven't
 * already been sent. `alreadySent` is the set of milestone kinds found in
 * `notification_deliveries` for this invoice — the idempotency check.
 */
export function dueReminders(
  invoice: {
    status: string;
    dueDate: string;
    reminderOverride: "default" | "off";
  },
  today: Date,
  alreadySent: ReminderMilestone[]
): ReminderMilestone[] {
  if (invoice.reminderOverride === "off") return [];
  if (!REMINDERABLE_STATUSES.has(invoice.status)) return [];

  const late = daysLate(invoice.dueDate, today);
  const sent = new Set(alreadySent);
  return MILESTONES.filter((m) => late >= m.days && !sent.has(m.kind)).map(
    (m) => m.kind
  );
}

/** An unpaid invoice past its due date that isn't flagged `overdue` yet. */
export function shouldMarkOverdue(
  status: string,
  dueDate: string,
  today: Date
): boolean {
  return (
    (status === "sent" || status === "viewed") && daysLate(dueDate, today) > 0
  );
}

export const DEFAULT_REMINDER_TEMPLATE =
  "Bonjour {{client}},\n\nSauf erreur de notre part, la facture {{number}} d'un montant de {{amount}} est toujours impayée ({{days}} jours de retard). Nous vous remercions de bien vouloir procéder au règlement dans les meilleurs délais.\n\n{{link}}";

/** Fills `{{client}} {{number}} {{amount}} {{days}} {{link}}` placeholders. */
export function renderReminderTemplate(
  template: string,
  vars: { client: string; number: string; amount: string; days: number; link: string }
): string {
  return template
    .replaceAll("{{client}}", vars.client)
    .replaceAll("{{number}}", vars.number)
    .replaceAll("{{amount}}", vars.amount)
    .replaceAll("{{days}}", String(vars.days))
    .replaceAll("{{link}}", vars.link);
}
