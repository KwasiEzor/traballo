/**
 * Marketing site contact form → Traballo team.
 */
import * as React from "react";
import { EmailLayout, P, Field, Quote, Divider } from "@/lib/email/layout";

interface ContactEmailProps {
  name: string;
  email: string;
  company?: string;
  topic: string;
  message: string;
}

export function ContactEmail({
  name,
  email,
  company,
  topic,
  message,
}: ContactEmailProps) {
  return (
    <EmailLayout
      preview={`Nouveau message de ${name} — ${topic}`}
      heading={`Nouveau message — ${topic}`}
      footnote="Reçu via le formulaire de contact de traballo.pro. Répondez directement à ce message."
    >
      <Field label="Nom">{name}</Field>
      <Field label="E-mail">{email}</Field>
      {company ? <Field label="Entreprise">{company}</Field> : null}
      <Divider />
      <P muted>Message</P>
      <Quote>{message}</Quote>
    </EmailLayout>
  );
}

export default ContactEmail;
