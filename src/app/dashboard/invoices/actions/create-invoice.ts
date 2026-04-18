/**
 * Create invoice server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, invoiceItems } from "@/db/schema";
import { createInvoiceSchema } from "@/lib/validations/invoice";
import type { CreateInvoiceInput } from "@/lib/validations/invoice";
import { ZodError } from "zod";

export async function createInvoice(input: CreateInvoiceInput) {
  try {
    // Auth check
    const { tenantId } = await requireAuth();

    // Validate input
    const validated = createInvoiceSchema.parse(input);

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    const itemsWithTotals = validated.items.map((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemTax = (itemSubtotal * item.taxRate) / 100;
      const itemTotal = itemSubtotal + itemTax;

      subtotal += itemSubtotal;
      taxAmount += itemTax;

      return {
        ...item,
        total: itemTotal.toFixed(2),
      };
    });

    const total = subtotal + taxAmount;

    // Generate invoice number (simple increment - improve later)
    const lastInvoice = await db.query.invoices.findFirst({
      where: (invoices, { eq }) => eq(invoices.tenantId, tenantId),
      orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
    });

    const invoiceNumber = lastInvoice
      ? `INV-${String(parseInt(lastInvoice.invoiceNumber.split("-")[1] || "0") + 1).padStart(4, "0")}`
      : "INV-0001";

    // Create invoice with items in transaction
    const [invoice] = await db.transaction(async (tx) => {
      const [newInvoice] = await tx
        .insert(invoices)
        .values({
          tenantId,
          clientId: validated.clientId,
          invoiceNumber,
          issueDate: validated.issueDate,
          dueDate: validated.dueDate,
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          total: total.toFixed(2),
          status: "draft",
        })
        .returning();

      // Insert items
      await tx.insert(invoiceItems).values(
        itemsWithTotals.map((item) => ({
          tenantId,
          invoiceId: newInvoice.id,
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          taxRate: String(item.taxRate),
          total: item.total,
        }))
      );

      return [newInvoice];
    });

    revalidatePath("/dashboard/invoices");
    redirect(`/dashboard/invoices/${invoice.id}`);
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof ZodError) {
      return {
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }

    console.error("Create invoice error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}
