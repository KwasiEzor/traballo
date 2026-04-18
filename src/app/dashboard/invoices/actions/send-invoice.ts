/**
 * Send invoice email server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createTenantClient } from "@/lib/db/tenant";
import { sendEmail } from "@/lib/email/send";
import { InvoiceEmail } from "@/lib/email/templates/invoice-email";
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

    // Send email
    const result = await sendEmail({
      to: invoice.client.email,
      subject: `Facture ${invoice.invoiceNumber} de ${artisanProfile.businessName}`,
      react: InvoiceEmail({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.client.name,
        total: invoice.total,
        dueDate: invoice.dueDate,
        artisanBusinessName: artisanProfile.businessName,
        pdfUrl: invoice.pdfUrl || undefined,
      }),
      replyTo: artisanProfile.email,
    });

    if (result.error) {
      return { error: result.error };
    }

    // Mark as sent
    await updateInvoiceStatus(invoiceId, "sent");

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
