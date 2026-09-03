import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

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
    <Html lang="fr">
      <Head />
      <Preview>{`Nouveau message de ${name} — ${topic}`}</Preview>
      <Body style={{ backgroundColor: "#f3f4f6", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ margin: "0 auto", padding: "24px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "18px", color: "#111827" }}>
            Nouveau message — {topic}
          </Heading>
          <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
            <strong>Nom :</strong> {name}
          </Text>
          <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
            <strong>E-mail :</strong> {email}
          </Text>
          {company ? (
            <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
              <strong>Entreprise :</strong> {company}
            </Text>
          ) : null}
          <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
          <Text style={{ fontSize: "14px", color: "#111827", whiteSpace: "pre-wrap" }}>
            {message}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ContactEmail;
