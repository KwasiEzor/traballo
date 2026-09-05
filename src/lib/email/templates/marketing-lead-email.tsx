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
    <Html lang="fr">
      <Head />
      <Preview>{`Nouveau contact via l'assistant du site — ${email}`}</Preview>
      <Body style={{ backgroundColor: "#f3f4f6", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ margin: "0 auto", padding: "24px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "18px", color: "#111827" }}>
            Nouveau contact via l&apos;assistant du site Traballo
          </Heading>
          <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
            <strong>E-mail :</strong> {email}
          </Text>
          {name ? (
            <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
              <strong>Nom :</strong> {name}
            </Text>
          ) : null}
          {note ? (
            <>
              <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
              <Text style={{ fontSize: "14px", color: "#111827", whiteSpace: "pre-wrap" }}>
                {note}
              </Text>
            </>
          ) : null}
          {transcript ? (
            <>
              <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
              <Text style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "pre-wrap" }}>
                {transcript}
              </Text>
            </>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}
