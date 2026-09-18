/**
 * A new appointment created by the artisan → their client. Same lightly-
 * branded shell as InvoiceEmail — signed by the artisan, Traballo footnote.
 */
import * as React from "react";
import { EmailLayout, P } from "@/lib/email/layout";
import { formatAppointmentRange, AppointmentBox } from "./appointment-shared";

interface AppointmentEmailProps {
  clientName: string;
  title: string;
  startTime: string;
  endTime: string;
  artisanBusinessName: string;
}

export function AppointmentConfirmationEmail({
  clientName = "Client",
  title = "Rendez-vous",
  startTime = "2026-01-01T09:00:00Z",
  endTime = "2026-01-01T10:00:00Z",
  artisanBusinessName = "Mon Entreprise",
}: AppointmentEmailProps) {
  const { date, hours } = formatAppointmentRange(startTime, endTime);

  return (
    <EmailLayout
      preview={`Rendez-vous confirmé avec ${artisanBusinessName} le ${date}`}
      heading="Rendez-vous confirmé"
      footnote={`Rendez-vous pris par ${artisanBusinessName}, envoyé via Traballo.`}
      signature={{ name: artisanBusinessName }}
    >
      <P>Bonjour {clientName},</P>
      <P>
        <strong>{artisanBusinessName}</strong> vous confirme un rendez-vous :
      </P>

      <AppointmentBox label="Rendez-vous" title={title} date={date} hours={hours} />

      <P muted>
        Un empêchement ? Répondez directement à cet e-mail pour reprogrammer.
      </P>
    </EmailLayout>
  );
}

export default AppointmentConfirmationEmail;
