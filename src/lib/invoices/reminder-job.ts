import { createNotification } from "@/lib/notifications/create";
import { formatDate, formatEUR } from "@/lib/utils";
import {
  claimReminder,
  findReminderCandidates,
  markOverdue,
  releaseReminder,
  sentReminderKinds,
  type ReminderCandidate,
} from "./reminder-data";
import { sendInvoiceReminder } from "./reminder-send";
import {
  dueReminder,
  parisToday,
  remindersIncluded,
  type ReminderKind,
} from "./reminders";

export type ReminderRunSummary = {
  today: string;
  candidates: number;
  markedOverdue: number;
  remindersSent: number;
  remindersFailed: number;
};

const LABEL: Record<ReminderKind, string> = {
  reminder_j7: "J+7",
  reminder_j30: "J+30",
};

/**
 * Daily invoice job (cron, Phase 3a): flip unpaid invoices past their due
 * date to `overdue` and tell the artisan, then send the J+7 / J+30 payment
 * reminders to their clients (Pro+, if the artisan kept them on and did not
 * pause them for that invoice).
 *
 * Idempotent: the status flip and the ledger claim each happen once, so a
 * re-run the same day sends nothing twice. One invoice failing does not stop
 * the others.
 */
export async function runInvoiceReminders(
  now: Date = new Date()
): Promise<ReminderRunSummary> {
  const today = parisToday(now);
  const candidates = await findReminderCandidates(today);
  const sent = await sentReminderKinds(candidates.map((c) => c.invoiceId));
  const summary: ReminderRunSummary = {
    today,
    candidates: candidates.length,
    markedOverdue: 0,
    remindersSent: 0,
    remindersFailed: 0,
  };

  for (const c of candidates) {
    try {
      if (c.status !== "overdue" && (await markOverdue(c.invoiceId, c.tenantId))) {
        summary.markedOverdue++;
        await announceOverdue(c);
      }

      const kind = reminderToSend(c, today, sent.get(c.invoiceId));
      if (!kind || !(await claimReminder(c.tenantId, c.invoiceId, kind))) continue;

      if (await sendInvoiceReminder(c, kind, today)) {
        summary.remindersSent++;
        await createNotification({
          tenantId: c.tenantId,
          type: "invoices.reminder_sent",
          title: `Relance envoyée : facture ${c.invoiceNumber}`,
          body: `${c.clientName} a reçu la relance ${LABEL[kind]} (${formatEUR(c.total)} TTC).`,
          actionUrl: `/dashboard/invoices/${c.invoiceId}`,
        });
      } else {
        summary.remindersFailed++;
        await releaseReminder(c.tenantId, c.invoiceId, kind);
      }
    } catch (err) {
      console.error(`[invoice-reminders] ${c.invoiceId} failed`, err);
    }
  }

  return summary;
}

function reminderToSend(
  c: ReminderCandidate,
  today: string,
  sent: ReadonlySet<string> = new Set()
): ReminderKind | null {
  if (
    !remindersIncluded(c.plan) ||
    !c.remindersEnabled ||
    c.remindersPaused ||
    !c.clientEmail
  ) {
    return null;
  }
  return dueReminder(c.dueDate, today, sent);
}

function announceOverdue(c: ReminderCandidate): Promise<unknown> {
  return createNotification({
    tenantId: c.tenantId,
    type: "invoices.overdue",
    title: `Facture ${c.invoiceNumber} en retard`,
    body: `${c.clientName} — ${formatEUR(c.total)} TTC, échéance le ${formatDate(c.dueDate)}.`,
    actionUrl: `/dashboard/invoices/${c.invoiceId}`,
    email: {
      subject: `Facture ${c.invoiceNumber} en retard de paiement`,
      cta: "Voir la facture",
    },
  });
}
