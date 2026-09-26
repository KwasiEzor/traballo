/**
 * An artisan's invoice → their client. Sent from the artisan's identity;
 * the shell stays lightly Traballo-branded ("Envoyé via Traballo").
 */
import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";
import { PaymentBlock } from "@/lib/email/payment-block";
import type { PaymentDetails } from "@/lib/invoices/payment";

interface InvoiceEmailProps {
  invoiceNumber: string;
  clientName: string;
  total: string;
  dueDate: string;
  artisanBusinessName: string;
  /** Download link — only an https URL is shown (a data: URL is useless in mail). */
  pdfUrl?: string;
  /** The PDF travels as an attachment. */
  pdfAttached?: boolean;
  payment?: PaymentDetails | null;
}

export function InvoiceEmail({
  invoiceNumber = "2026-0001",
  clientName = "Client",
  total = "0.00",
  dueDate = "2026-01-31",
  artisanBusinessName = "Mon Entreprise",
  pdfUrl,
  pdfAttached,
  payment,
}: InvoiceEmailProps) {
  const due = new Date(dueDate).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <EmailLayout
      preview={`Facture ${invoiceNumber} de ${artisanBusinessName}`}
      heading="Votre facture"
      footnote={`Facture émise par ${artisanBusinessName}, envoyée via Traballo.`}
      signature={{ name: artisanBusinessName }}
    >
      <P>Bonjour {clientName},</P>
      <P>
        Vous avez reçu une nouvelle facture de la part de{" "}
        <strong>{artisanBusinessName}</strong>.
      </P>

      <Section style={box}>
        <Text style={boxNumber}>Facture {invoiceNumber}</Text>
        <Text style={boxAmount}>{total} € TTC</Text>
        <Text style={boxDue}>À régler avant le {due}</Text>
      </Section>

      {payment ? <PaymentBlock payment={payment} /> : null}

      {pdfAttached ? <P>La facture est jointe à cet e-mail.</P> : null}

      {pdfUrl?.startsWith("https://") ? (
        <Btn href={pdfUrl}>Télécharger la facture (PDF)</Btn>
      ) : null}

      <P muted>
        Pour toute question sur cette facture, répondez directement à cet
        e-mail.
      </P>
    </EmailLayout>
  );
}

const box: React.CSSProperties = {
  backgroundColor: B.page,
  border: `1px solid ${B.border}`,
  borderRadius: "10px",
  padding: "20px",
  textAlign: "center",
  margin: "16px 0",
};
const boxNumber: React.CSSProperties = {
  fontSize: "12px",
  color: B.muted,
  margin: "0 0 6px",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};
const boxAmount: React.CSSProperties = {
  fontSize: "26px",
  fontWeight: 700,
  color: B.ink,
  margin: "0 0 6px",
};
const boxDue: React.CSSProperties = {
  fontSize: "13px",
  color: B.muted,
  margin: 0,
};

export default InvoiceEmail;
