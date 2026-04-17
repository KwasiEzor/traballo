"use client";

/**
 * Invoice actions dropdown
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateInvoicePDF } from "../actions/generate-pdf";
import type { Invoice } from "@/db/schema";

interface InvoiceActionsProps {
  invoice: Invoice & { client: { name: string } };
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const result = await generateInvoicePDF(invoice.id);

      if (result.error) {
        alert(result.error);
      } else if (result.pdfUrl) {
        // Download PDF
        const link = document.createElement("a");
        link.href = result.pdfUrl;
        link.download = `${invoice.invoiceNumber}.pdf`;
        link.click();

        router.refresh();
      }
    } catch (error) {
      alert("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const { updateInvoiceStatus } = await import("../actions/update-status");
      const result = await updateInvoiceStatus(invoice.id, "sent");

      if (result.error) {
        alert(result.error);
      } else {
        // TODO: Actually send email via Resend
        alert("Facture marquée comme envoyée (envoi email à venir)");
        router.refresh();
      }
    } catch (error) {
      alert("Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setLoading(true);
    try {
      const { updateInvoiceStatus } = await import("../actions/update-status");
      const result = await updateInvoiceStatus(invoice.id, "paid");

      if (result.error) {
        alert(result.error);
      } else {
        alert("Facture marquée comme payée");
        router.refresh();
      }
    } catch (error) {
      alert("Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleGeneratePDF}
        disabled={loading}
        className="rounded-lg border bg-white px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
      >
        📄 Générer PDF
      </button>
      {invoice.status === "draft" && (
        <button
          onClick={handleSendEmail}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          📧 Envoyer
        </button>
      )}
      {invoice.status === "sent" && (
        <button
          onClick={handleMarkAsPaid}
          disabled={loading}
          className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          ✓ Marquer payée
        </button>
      )}
    </div>
  );
}
