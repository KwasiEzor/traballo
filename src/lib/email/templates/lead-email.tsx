/**
 * A visitor's request from the artisan's public site (contact form or AI
 * assistant) → the artisan.
 */
import * as React from "react";
import { EmailLayout, P, Field, Quote, Divider } from "@/lib/email/layout";

export function LeadEmail({
  businessName,
  name,
  contact,
  message,
}: {
  businessName: string;
  name: string;
  contact: string;
  message: string;
}) {
  return (
    <EmailLayout
      preview={`Nouvelle demande de ${name}`}
      heading="Nouvelle demande client"
      footnote={`Reçu via votre site ${businessName}. Rappelez ou répondez au contact indiqué.`}
    >
      <P>
        Un visiteur de votre site <strong>{businessName}</strong> souhaite être
        recontacté.
      </P>
      <Divider />
      <Field label="Nom">{name}</Field>
      <Field label="Contact">{contact}</Field>
      <Divider />
      <P muted>Sa demande</P>
      <Quote>{message}</Quote>
    </EmailLayout>
  );
}

export default LeadEmail;
