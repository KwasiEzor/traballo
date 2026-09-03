"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileDown, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { generateInvoicePDF } from "./actions/generate-pdf";
import { sendInvoiceEmail } from "./actions/send-invoice";
import { updateInvoiceStatus } from "./actions/update-status";

interface Props {
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
    client: { name: string; email: string | null };
  };
}

export function InvoiceActions({ invoice }: Props) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<null | "pdf" | "send" | "paid">(null);

  async function onPdf() {
    setBusy("pdf");
    const res = await generateInvoicePDF(invoice.id);
    setBusy(null);
    if ("error" in res && res.error) return toast.error(res.error);
    if ("pdfUrl" in res && res.pdfUrl) {
      window.open(res.pdfUrl, "_blank");
      toast.success("PDF généré.");
      router.refresh();
    }
  }

  async function onSend() {
    setBusy("send");
    const res = await sendInvoiceEmail(invoice.id);
    setBusy(null);
    if ("error" in res && res.error) return toast.error(res.error);
    toast.success(`Facture envoyée à ${invoice.client.name}.`);
    router.refresh();
  }

  async function onPaid() {
    setBusy("paid");
    const res = await updateInvoiceStatus(invoice.id, "paid");
    setBusy(null);
    if ("error" in res && res.error) return toast.error(res.error);
    toast.success("Facture marquée comme payée.");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onPdf} disabled={busy !== null}>
        {busy === "pdf" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileDown className="size-4" />
        )}
        PDF
      </Button>

      {(invoice.status === "draft" || invoice.status === "overdue") && (
        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={busy !== null || !invoice.client.email}>
              <Send className="size-4" /> Envoyer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Envoyer la facture {invoice.invoiceNumber}</DialogTitle>
              <DialogDescription>
                {invoice.client.email
                  ? `Un e-mail sera envoyé à ${invoice.client.name} (${invoice.client.email}) avec la facture en pièce jointe.`
                  : "Ce client n'a pas d'adresse e-mail."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Annuler</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={onSend} disabled={!invoice.client.email}>
                  Envoyer maintenant
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {["sent", "viewed", "overdue"].includes(invoice.status) && (
        <Button variant="success" onClick={onPaid} disabled={busy !== null}>
          {busy === "paid" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Marquer payée
        </Button>
      )}
    </div>
  );
}
