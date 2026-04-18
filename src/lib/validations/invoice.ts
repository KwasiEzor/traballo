/**
 * Invoice validation schemas
 */

import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantity: z.coerce.number().positive("Quantité doit être positive"),
  unitPrice: z.coerce.number().nonnegative("Prix unitaire invalide"),
  taxRate: z.coerce.number().min(0).max(100).default(21),
});

const invoiceBaseSchema = z.object({
  clientId: z.string().uuid("Client invalide"),
  issueDate: z.string().min(1, "Date d'émission requise"),
  dueDate: z.string().min(1, "Date d'échéance requise"),
  items: z.array(invoiceItemSchema).min(1, "Au moins un article requis"),
  notes: z.string().optional(),
});

export const createInvoiceSchema = invoiceBaseSchema
  .refine((data) => data.dueDate >= data.issueDate, {
    message: "La date d'échéance doit être postérieure ou égale à la date d'émission",
    path: ["dueDate"],
  });

export const updateInvoiceSchema = invoiceBaseSchema.extend({
  id: z.string().uuid(),
  status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]),
}).refine((data) => data.dueDate >= data.issueDate, {
  message: "La date d'échéance doit être postérieure ou égale à la date d'émission",
  path: ["dueDate"],
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
