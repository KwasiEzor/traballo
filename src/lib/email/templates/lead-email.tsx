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
    <Html lang="fr">
      <Head />
      <Preview>{`Nouvelle demande de ${name}`}</Preview>
      <Body style={{ backgroundColor: "#f3f4f6", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ margin: "0 auto", padding: "24px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "18px", color: "#111827" }}>
            Nouvelle demande via le site de {businessName}
          </Heading>
          <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
            <strong>Nom :</strong> {name}
          </Text>
          <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
            <strong>Contact :</strong> {contact}
          </Text>
          <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
          <Text style={{ fontSize: "14px", color: "#111827", whiteSpace: "pre-wrap" }}>
            {message}
          </Text>
          <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
          <Text style={{ fontSize: "12px", color: "#9ca3af" }}>
            Répondez directement à ce message ou rappelez le contact indiqué.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default LeadEmail;
