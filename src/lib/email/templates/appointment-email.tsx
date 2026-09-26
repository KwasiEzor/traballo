/**
 * Appointment e-mails → the artisan's client (Phase 4): confirmation (at
 * creation or when the artisan confirms), reminder the day before (Pro+),
 * cancellation. White-label, reply-to the artisan, times in Paris; an .ics
 * file travels with the confirmation and the cancellation.
 */
import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailLayout, P } from "@/lib/email/layout";
import { EMAIL_BRAND as B, type EmailBrand } from "@/lib/email/brand";
import { formatDate } from "@/lib/utils";

export type AppointmentEmailKind = "confirmation" | "reminder" | "cancellation";

const HEADING: Record<AppointmentEmailKind, string> = {
  confirmation: "Rendez-vous confirmé",
  reminder: "Rappel : rendez-vous demain",
  cancellation: "Rendez-vous annulé",
};

export function AppointmentEmail({
  brand,
  kind,
  clientName,
  title,
  start,
  end,
  location,
  artisanPhone,
  calendarAttached,
}: {
  brand: EmailBrand;
  kind: AppointmentEmailKind;
  clientName: string;
  title: string;
  start: Date;
  end: Date;
  location?: string | null;
  artisanPhone?: string | null;
  calendarAttached: boolean;
}) {
  const day = formatDate(start, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hours = { hour: "2-digit", minute: "2-digit" } as const;
  const time = `${formatDate(start, hours)} – ${formatDate(end, hours)}`;
  const call = artisanPhone ? ` ou appelez le ${artisanPhone}` : "";

  return (
    <EmailLayout
      brand={brand}
      preview={`${HEADING[kind]} — ${brand.name}, ${day}`}
      heading={HEADING[kind]}
    >
      <P>Bonjour {clientName},</P>
      {kind === "confirmation" && (
        <P>
          Votre rendez-vous avec <strong>{brand.name}</strong> est confirmé.
        </P>
      )}
      {kind === "reminder" && (
        <P>
          Petit rappel : <strong>{brand.name}</strong> vous attend demain.
        </P>
      )}
      {kind === "cancellation" && (
        <P>
          Votre rendez-vous avec <strong>{brand.name}</strong> est annulé. Nous
          vous prions de nous excuser pour ce contretemps.
        </P>
      )}

      <Section style={{ ...box, borderColor: brand.color }}>
        <Text style={boxTitle}>{title}</Text>
        <Text style={boxWhen}>
          {day}
          <br />
          {time}
        </Text>
        {location ? <Text style={boxWhere}>{location}</Text> : null}
      </Section>

      {kind === "cancellation" ? (
        <P>
          Pour convenir d&apos;un autre créneau, répondez simplement à cet
          e-mail{call}.
        </P>
      ) : (
        <>
          {calendarAttached ? (
            <P>Ajoutez-le à votre agenda avec le fichier joint.</P>
          ) : null}
          <P muted>
            Un empêchement ? Répondez à cet e-mail{call}.
          </P>
        </>
      )}
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
const boxTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: B.ink,
  margin: "0 0 8px",
};
const boxWhen: React.CSSProperties = {
  fontSize: "15px",
  color: B.body,
  margin: "0 0 6px",
};
const boxWhere: React.CSSProperties = {
  fontSize: "13px",
  color: B.muted,
  margin: 0,
};

export default AppointmentEmail;
