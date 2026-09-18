/**
 * An appointment cancelled by the artisan → their client. Apologetic tone +
 * CTA to get back in touch (TRB-097).
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { formatAppointmentRange, AppointmentBox } from "./appointment-shared";

interface AppointmentCancelledEmailProps {
  clientName: string;
  title: string;
  startTime: string;
  endTime: string;
  artisanBusinessName: string;
  artisanEmail: string;
}

export function AppointmentCancelledEmail({
  clientName = "Client",
  title = "Rendez-vous",
  startTime = "2026-01-01T09:00:00Z",
  endTime = "2026-01-01T10:00:00Z",
  artisanBusinessName = "Mon Entreprise",
  artisanEmail = "contact@example.com",
}: AppointmentCancelledEmailProps) {
  const { date, hours } = formatAppointmentRange(startTime, endTime);

  return (
    <EmailLayout
      preview={`Rendez-vous annulé avec ${artisanBusinessName}`}
      heading="Rendez-vous annulé"
      footnote={`Rendez-vous pris par ${artisanBusinessName}, envoyé via Traballo.`}
      signature={{ name: artisanBusinessName }}
    >
      <P>Bonjour {clientName},</P>
      <P>
        Désolé, <strong>{artisanBusinessName}</strong> doit annuler le
        rendez-vous suivant :
      </P>

      <AppointmentBox label="Rendez-vous annulé" title={title} date={date} hours={hours} />

      <P>
        N&apos;hésitez pas à reprendre contact pour convenir d&apos;un
        nouveau créneau.
      </P>
      <Btn href={`mailto:${artisanEmail}`}>Reprendre contact</Btn>
    </EmailLayout>
  );
}

export default AppointmentCancelledEmail;
