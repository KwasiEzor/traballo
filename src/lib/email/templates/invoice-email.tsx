/**
 * An artisan's invoice → their client. Sent from the artisan's identity;
 * the shell stays lightly Traballo-branded ("Envoyé via Traballo").
 */
import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";

interface InvoiceEmailProps {
  invoiceNumber: string;
  clientName: string;
  total: string;
  dueDate: string;
  artisanBusinessName: string;
  pdfUrl?: string;
}

export function InvoiceEmail({
  invoiceNumber = "2026-0001",
  clientName = "Client",
  total = "0.00",
  dueDate = "2026-01-31",
  artisanBusinessName = "Mon Entreprise",
  pdfUrl,
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

      {pdfUrl ? <Btn href={pdfUrl}>Télécharger la facture (PDF)</Btn> : null}

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
