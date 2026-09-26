import { sendEmail } from "@/lib/email/send";
import { artisanBrand, artisanSender } from "@/lib/email/brand";
import { InvoiceReminderEmail } from "@/lib/email/templates/invoice-reminder-email";
import { loadInvoicePdf, type ReminderCandidate } from "./reminder-data";
import { paymentDetails } from "./payment";
import { daysOverdue, type ReminderKind } from "./reminders";

type ReminderInvoice = Pick<
  ReminderCandidate,
  | "invoiceId"
  | "tenantId"
  | "invoiceNumber"
  | "total"
  | "dueDate"
  | "clientName"
  | "clientEmail"
  | "businessName"
  | "artisanEmail"
  | "artisanPhone"
  | "logoUrl"
  | "primaryColor"
  | "iban"
>;

/**
 * E-mail a payment reminder to the artisan's client: white-label, reply-to
 * the artisan, PDF attached, transfer details when there is an IBAN. Used by
 * the cron (J+7 / J+30) and by the "Relancer" button (`manual`).
 *
 * Never throws: true if the e-mail went out.
 */
export async function sendInvoiceReminder(
  c: ReminderInvoice,
  kind: ReminderKind | "manual",
  today: string
): Promise<boolean> {
  if (!c.clientEmail) return false;
  try {
    const pdf = await loadInvoicePdf(c.invoiceId, c.tenantId);
    const res = await sendEmail({
      from: artisanSender(c.businessName),
      to: c.clientEmail,
      replyTo: c.artisanEmail,
      subject:
        kind === "reminder_j30"
          ? `Facture ${c.invoiceNumber} impayée — ${c.businessName}`
          : `Rappel : facture ${c.invoiceNumber} — ${c.businessName}`,
      react: InvoiceReminderEmail({
        brand: artisanBrand(c),
        kind,
        clientName: c.clientName,
        invoiceNumber: c.invoiceNumber,
        total: c.total,
        dueDate: c.dueDate,
        daysLate: daysOverdue(c.dueDate, today),
        pdfAttached: pdf !== null,
        artisanPhone: c.artisanPhone,
        payment: paymentDetails(c),
      }),
      ...(pdf
        ? { attachments: [{ filename: `facture-${c.invoiceNumber}.pdf`, content: pdf }] }
        : {}),
    });
    if ("error" in res && res.error) {
      console.error(`[invoice-reminders] ${c.invoiceId} not sent`, res.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[invoice-reminders] ${c.invoiceId} send failed`, err);
    return false;
  }
}
