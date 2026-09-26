"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import {
  claimReminder,
  loadInvoicePdf,
  loadReminderCandidate,
  releaseReminder,
} from "@/lib/invoices/reminder-data";
import { sendInvoiceReminder } from "@/lib/invoices/reminder-send";
import { parisToday } from "@/lib/invoices/reminders";
import { err, errors, ok, type Result } from "@/lib/result";
import { generateInvoicePDF } from "./generate-pdf";

const REMINDABLE = new Set(["sent", "viewed", "overdue"]);

/**
 * "Relancer" button: e-mail a payment reminder to the client now, every
 * plan, at most once a day per invoice (ledger `manual:<date>`). Unlike
 * re-sending the invoice, it leaves the status alone.
 */
export async function sendInvoiceReminderAction(
  invoiceId: unknown
): Promise<Result<{ sentTo: string }>> {
  const parsed = z.uuid().safeParse(invoiceId);
  if (!parsed.success) return err(errors.validation(parsed.error.issues));
  const id = parsed.data;

  try {
    const { tenantId, impersonating } = await requireAuth();
    if (impersonating) {
      return err({ code: "FORBIDDEN", message: "Action indisponible en mode support." });
    }

    const invoice = await withTenant(tenantId, (tx) =>
      loadReminderCandidate(tx, id, tenantId)
    );
    if (!invoice) return err(errors.notFound("Facture"));
    if (!REMINDABLE.has(invoice.status)) {
      return err({
        code: "CONFLICT",
        message: "Seule une facture envoyée et non réglée peut être relancée.",
      });
    }
    if (!invoice.clientEmail) {
      return err({ code: "CONFLICT", message: "Ce client n'a pas d'adresse e-mail." });
    }

    const today = parisToday();
    const kind = `manual:${today}`;
    if (!(await claimReminder(tenantId, id, kind))) {
      return err({
        code: "CONFLICT",
        message: "Une relance a déjà été envoyée aujourd'hui pour cette facture.",
      });
    }
    // The dialog promises the PDF as attachment: generate it if the artisan
    // never did (the cron cannot — no session — and sends without it).
    if (!(await loadInvoicePdf(id, tenantId))) await generateInvoicePDF(id);

    if (!(await sendInvoiceReminder(invoice, "manual", today))) {
      await releaseReminder(id, kind);
      return err({
        code: "EXTERNAL_API_ERROR",
        message: "L'envoi a échoué. Réessayez plus tard.",
      });
    }

    revalidatePath(`/dashboard/invoices/${id}`);
    return ok({ sentTo: invoice.clientEmail });
  } catch (e) {
    console.error("sendInvoiceReminderAction failed", e);
    return err({ code: "INTERNAL_ERROR", message: "La relance n'a pas pu être envoyée." });
  }
}
