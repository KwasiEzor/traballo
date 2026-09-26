/**
 * Send invoice email server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createTenantClient } from "@/lib/db/tenant";
import { sendEmail } from "@/lib/email/send";
import { artisanSender } from "@/lib/email/brand";
import { InvoiceEmail } from "@/lib/email/templates/invoice-email";
import { paymentDetails } from "@/lib/invoices/payment";
import { pdfFromDataUrl } from "@/lib/invoices/reminders";
import { generateInvoicePDF } from "./generate-pdf";
import { updateInvoiceStatus } from "./update-status";

export async function sendInvoiceEmail(invoiceId: string) {
  try {
    const { tenantId } = await requireAuth();

    // Fetch invoice
    const tenantDb = createTenantClient(tenantId);
    const invoice = await tenantDb.query.invoices.findFirst({
      where: (invoices, { eq }) => eq(invoices.id, invoiceId),
      with: {
        client: true,
      },
    });

    if (!invoice) {
      return { error: "Invoice not found" };
    }

    if (!invoice.client.email) {
      return { error: "Client email not found" };
    }

    // Fetch artisan profile
    const artisanProfile = await tenantDb.query.artisanProfiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.tenantId, tenantId),
    });

    if (!artisanProfile) {
      return { error: "Artisan profile not found" };
    }

    // The PDF travels as an attachment (a data: URL link is blocked by mail
    // clients); generate it first if the artisan never did.
    let pdf = pdfFromDataUrl(invoice.pdfUrl);
    if (!pdf) {
      const generated = await generateInvoicePDF(invoiceId);
      if ("pdfUrl" in generated && generated.pdfUrl) {
        pdf = pdfFromDataUrl(generated.pdfUrl);
      }
    }

    // Send email
    const result = await sendEmail({
      from: artisanSender(artisanProfile.businessName),
      to: invoice.client.email,
      subject: `Facture ${invoice.invoiceNumber} de ${artisanProfile.businessName}`,
      react: InvoiceEmail({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.client.name,
        total: invoice.total,
        dueDate: invoice.dueDate,
        artisanBusinessName: artisanProfile.businessName,
        pdfAttached: pdf !== null,
        payment: paymentDetails({
          iban: artisanProfile.iban,
          invoiceNumber: invoice.invoiceNumber,
        }),
      }),
      replyTo: artisanProfile.email,
      ...(pdf
        ? {
            attachments: [
              { filename: `facture-${invoice.invoiceNumber}.pdf`, content: pdf },
            ],
          }
        : {}),
    });

    if (result.error) {
      return { error: result.error };
    }

    // Mark as sent — only a draft: re-sending an overdue invoice must not
    // pull it back to "sent" (the cron would flag it overdue again).
    if (invoice.status === "draft") {
      await updateInvoiceStatus(invoiceId, "sent");
    }

    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/invoices");

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Send invoice email error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
