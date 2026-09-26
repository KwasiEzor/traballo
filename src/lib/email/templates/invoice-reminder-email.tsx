/**
 * Payment reminder → the artisan's client: sent by the cron at J+7 and J+30
 * after the due date (Phase 3a), or by the artisan's "Relancer" button
 * (`manual`, Phase 3b). White-label: the artisan's name, logo and colour,
 * reply-to the artisan; the invoice PDF is attached when there is one, and
 * the transfer details when the artisan gave an IBAN.
 */
import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailLayout, P } from "@/lib/email/layout";
import { EMAIL_BRAND as B, type EmailBrand } from "@/lib/email/brand";
import { PaymentBlock } from "@/lib/email/payment-block";
import type { PaymentDetails } from "@/lib/invoices/payment";
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
  payment,
}: {
  brand: EmailBrand;
  kind: ReminderKind | "manual";
  clientName: string;
  invoiceNumber: string;
  /** Numeric string as stored (`"1234.50"`). */
  total: string;
  /** `YYYY-MM-DD`. */
  dueDate: string;
  daysLate: number;
  pdfAttached: boolean;
  artisanPhone?: string | null;
  payment?: PaymentDetails | null;
}) {
  const amount = formatEUR(total);
  const due = formatDate(dueDate);
  const firm = kind === "reminder_j30";
  const upcoming = kind === "manual" && daysLate <= 0;

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
      ) : upcoming ? (
        <P>
          Petit rappel : la facture <strong>{invoiceNumber}</strong> arrive à
          échéance le {due}.
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

      {payment ? <PaymentBlock payment={payment} /> : null}

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
