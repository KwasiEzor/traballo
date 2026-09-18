/**
 * Reminder sent the day before an appointment → the artisan's client.
 * Automated (cron), Pro+ only — see the reminder gating in
 * src/app/api/cron/appointment-reminders/route.ts.
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

export function AppointmentReminderEmail({
  clientName = "Client",
  title = "Rendez-vous",
  startTime = "2026-01-01T09:00:00Z",
  endTime = "2026-01-01T10:00:00Z",
  artisanBusinessName = "Mon Entreprise",
}: AppointmentEmailProps) {
  const { date, hours } = formatAppointmentRange(startTime, endTime);

  return (
    <EmailLayout
      preview={`Rappel — rendez-vous avec ${artisanBusinessName} le ${date}`}
      heading="Rappel de rendez-vous"
      footnote={`Rendez-vous pris par ${artisanBusinessName}, envoyé via Traballo.`}
      signature={{ name: artisanBusinessName }}
    >
      <P>Bonjour {clientName},</P>
      <P>
        Petit rappel : vous avez rendez-vous avec{" "}
        <strong>{artisanBusinessName}</strong>.
      </P>

      <AppointmentBox label="Rendez-vous" title={title} date={date} hours={hours} />

      <P muted>
        Un empêchement ? Répondez directement à cet e-mail pour reprogrammer.
      </P>
    </EmailLayout>
  );
}

export default AppointmentReminderEmail;
