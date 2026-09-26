/**
 * Payment reminder → the artisan's client (Phase 3a, sent by the cron at
 * J+7 and J+30 after the due date). White-label: the artisan's name, logo
 * and colour, reply-to the artisan; the invoice PDF is attached when there
 * is one.
 */
import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailLayout, P } from "@/lib/email/layout";
import { EMAIL_BRAND as B, type EmailBrand } from "@/lib/email/brand";
import type { ReminderKind } from "@/lib/invoices/reminders";
import { formatDate, formatEUR } from "@/lib/utils";

export function InvoiceReminderEmail({
  brand,
  kind,
  clientName,
  invoiceNumber,
  total,
  dueDate,
  daysLate,
  pdfAttached,
  artisanPhone,
}: {
  brand: EmailBrand;
  kind: ReminderKind;
  clientName: string;
  invoiceNumber: string;
  /** Numeric string as stored (`"1234.50"`). */
  total: string;
  /** `YYYY-MM-DD`. */
  dueDate: string;
  daysLate: number;
  pdfAttached: boolean;
  artisanPhone?: string | null;
}) {
  const amount = formatEUR(total);
  const due = formatDate(dueDate);
  const firm = kind === "reminder_j30";

  return (
    <EmailLayout
      brand={brand}
      preview={`Rappel : facture ${invoiceNumber} de ${brand.name}`}
      heading={firm ? `Facture ${invoiceNumber} impayée` : `Rappel : facture ${invoiceNumber}`}
    >
      <P>Bonjour {clientName},</P>
      {firm ? (
        <P>
          La facture <strong>{invoiceNumber}</strong> est en attente de
          règlement depuis {daysLate} jours. Merci de procéder au paiement dans
          les meilleurs délais.
        </P>
      ) : (
        <P>
          Sauf erreur de notre part, la facture <strong>{invoiceNumber}</strong>{" "}
          arrivée à échéance le {due} n&apos;a pas encore été réglée. Si le
          paiement est déjà en cours, merci de ne pas tenir compte de ce
          message.
        </P>
      )}

      <Section style={{ ...box, borderColor: brand.color }}>
        <Text style={boxNumber}>Facture {invoiceNumber}</Text>
        <Text style={boxAmount}>{amount} TTC</Text>
        <Text style={boxDue}>Échéance : {due}</Text>
      </Section>

      {pdfAttached ? <P>La facture est jointe à cet e-mail.</P> : null}

      <P muted>
        Une question sur cette facture ? Répondez simplement à cet e-mail
        {artisanPhone ? ` ou appelez le ${artisanPhone}` : ""}.
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
