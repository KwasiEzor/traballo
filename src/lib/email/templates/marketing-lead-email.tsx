/**
 * A prospect leaving their e-mail via the assistant on traballo.pro →
 * Traballo team.
 */
import * as React from "react";
import { EmailLayout, P, Field, Quote, Divider } from "@/lib/email/layout";

export function MarketingLeadEmail({
  email,
  name,
  note,
  transcript,
}: {
  email: string;
  name?: string;
  note?: string;
  transcript?: string;
}) {
  return (
    <EmailLayout
      preview={`Nouveau contact via l'assistant du site — ${email}`}
      heading="Nouveau contact — assistant du site"
      footnote="Le visiteur a laissé ses coordonnées depuis l'assistant de traballo.pro."
    >
      <Field label="E-mail">{email}</Field>
      {name ? <Field label="Nom">{name}</Field> : null}
      {note ? (
        <>
          <Divider />
          <P muted>Message</P>
          <Quote>{note}</Quote>
        </>
      ) : null}
      {transcript ? (
        <>
          <Divider />
          <P muted>Extrait de la conversation</P>
          <Quote>{transcript}</Quote>
        </>
      ) : null}
    </EmailLayout>
  );
}

export default MarketingLeadEmail;
