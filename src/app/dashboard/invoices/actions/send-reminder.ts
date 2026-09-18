/**
 * Manual "send a reminder now" server action — TRB-059. Ignores the J+7/J+30
 * milestones (those are the cron's job); a click always sends, so it isn't
 * recorded in the notification_deliveries ledger.
 */
"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createTenantClient } from "@/lib/db/tenant";
import { isPremiumPlan } from "@/lib/artisan/templates";
import { daysLate, renderReminderTemplate, DEFAULT_REMINDER_TEMPLATE } from "@/lib/invoices/reminders";
import { sendEmail } from "@/lib/email/send";
import { InvoiceReminderEmail } from "@/lib/email/templates/invoice-reminder-email";
import { createNotification } from "@/lib/notifications/create";
import { formatEUR } from "@/lib/utils";

const REMINDERABLE_STATUSES = new Set(["sent", "viewed", "overdue"]);

export async function sendInvoiceReminder(invoiceId: string) {
  try {
    const { tenantId, plan } = await requireAuth();
    if (!isPremiumPlan(plan)) {
      return { error: "Les relances de factures sont réservées aux plans Pro et Business." };
    }

    const tenantDb = createTenantClient(tenantId);
    const invoice = await tenantDb.query.invoices.findFirst({
      where: (t, { eq }) => eq(t.id, invoiceId),
      with: { client: true },
    });
    if (!invoice) return { error: "Facture introuvable." };
    if (!REMINDERABLE_STATUSES.has(invoice.status)) {
      return { error: "Cette facture ne peut pas être relancée." };
    }
    if (!invoice.client.email) {
      return { error: "Ce client n'a pas d'adresse e-mail." };
    }

    const profile = await tenantDb.query.artisanProfiles.findFirst({
      where: (t, { eq }) => eq(t.tenantId, tenantId),
    });
    if (!profile) return { error: "Profil artisan introuvable." };

    const late = Math.max(0, daysLate(invoice.dueDate, new Date()));
    const body = renderReminderTemplate(
      profile.invoiceReminderTemplate || DEFAULT_REMINDER_TEMPLATE,
      {
        client: invoice.client.name,
        number: invoice.invoiceNumber,
        amount: formatEUR(invoice.total),
        days: late,
        link: invoice.pdfUrl ?? "",
      }
    );

    const result = await sendEmail({
      to: invoice.client.email,
      subject: `Rappel — facture ${invoice.invoiceNumber} de ${profile.businessName}`,
      react: InvoiceReminderEmail({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.client.name,
        total: formatEUR(invoice.total),
        dueDate: invoice.dueDate,
        artisanBusinessName: profile.businessName,
        body,
        pdfUrl: invoice.pdfUrl ?? undefined,
      }),
      replyTo: profile.email,
    });
    if (result.error) return { error: result.error };

    await createNotification({
      tenantId,
      type: "invoices.reminder_sent",
      title: `Relance envoyée — facture ${invoice.invoiceNumber}`,
      body: `Rappel manuel envoyé à ${invoice.client.name}.`,
      actionUrl: `/dashboard/invoices/${invoiceId}`,
    });

    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Send invoice reminder error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to send reminder",
    };
  }
}
