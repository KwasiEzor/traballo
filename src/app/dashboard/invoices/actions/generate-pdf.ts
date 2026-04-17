/**
 * Generate invoice PDF server action
 */

"use server";

import { renderToBuffer } from "@react-pdf/renderer";
import { requireAuth } from "@/lib/auth";
import { getTenantId } from "@/lib/auth/tenant";
import { getTenantDb } from "@/lib/db/tenant";
import { InvoicePDFTemplate } from "@/lib/pdf/invoice-template";
import { db } from "@/lib/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function generateInvoicePDF(invoiceId: string) {
  try {
    await requireAuth();
    const tenantId = await getTenantId();

    if (!tenantId) {
      return { error: "Tenant context required" };
    }

    // Fetch invoice with all data
    const tenantDb = await getTenantDb();
    const invoice = await tenantDb.query.invoices.findFirst({
      where: (invoices, { eq }) => eq(invoices.id, invoiceId),
      with: {
        client: true,
        items: true,
      },
    });

    if (!invoice) {
      return { error: "Invoice not found" };
    }

    // Fetch artisan profile
    const artisanProfile = await tenantDb.query.artisanProfiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.tenantId, tenantId),
    });

    if (!artisanProfile) {
      return { error: "Artisan profile not found" };
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      InvoicePDFTemplate({
        data: {
          invoiceNumber: invoice.invoiceNumber,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          subtotal: invoice.subtotal,
          taxAmount: invoice.taxAmount,
          total: invoice.total,
          client: invoice.client,
          items: invoice.items,
          artisan: artisanProfile,
        },
      })
    );

    // TODO: Upload to storage (Supabase Storage or S3)
    // For now, return base64 for download
    const base64 = pdfBuffer.toString("base64");
    const dataUrl = `data:application/pdf;base64,${base64}`;

    // Update invoice with PDF URL
    await db
      .update(invoices)
      .set({ pdfUrl: dataUrl })
      .where(eq(invoices.id, invoiceId));

    return { success: true, pdfUrl: dataUrl };
  } catch (error) {
    console.error("Generate PDF error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to generate PDF",
    };
  }
}
