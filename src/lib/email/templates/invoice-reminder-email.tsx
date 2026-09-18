/**
 * A J+7 / J+30 / manual invoice reminder → the artisan's client. Sent from
 * the artisan's identity, same lightly-branded shell as InvoiceEmail.
 */
import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";

interface InvoiceReminderEmailProps {
  invoiceNumber: string;
  clientName: string;
  total: string;
  dueDate: string;
  artisanBusinessName: string;
  /** Pre-rendered body text (placeholders already filled) — custom or default template. */
  body: string;
  pdfUrl?: string;
}

export function InvoiceReminderEmail({
  invoiceNumber = "2026-0001",
  clientName = "Client",
  total = "0.00",
  dueDate = "2026-01-31",
  artisanBusinessName = "Mon Entreprise",
  body,
  pdfUrl,
}: InvoiceReminderEmailProps) {
  const due = new Date(dueDate).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <EmailLayout
      preview={`Rappel — facture ${invoiceNumber} de ${artisanBusinessName}`}
      heading="Rappel de facture"
      footnote={`Facture émise par ${artisanBusinessName}, envoyée via Traballo.`}
      signature={{ name: artisanBusinessName }}
    >
      {body.split("\n").map((line, i) => (
        <P key={i}>{line || " "}</P>
      ))}

      <Section style={box}>
        <Text style={boxNumber}>Facture {invoiceNumber}</Text>
        <Text style={boxAmount}>{total} € TTC</Text>
        <Text style={boxDue}>Échue depuis le {due}</Text>
      </Section>

      {pdfUrl ? <Btn href={pdfUrl}>Télécharger la facture (PDF)</Btn> : null}

      <P muted>
        Si le paiement a déjà été effectué, merci d&apos;ignorer ce rappel.
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

export default InvoiceReminderEmail;
