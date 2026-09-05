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

export function UpgradeRequestEmail({
  businessName,
  ownerName,
  email,
  phone,
  slug,
  currentPlan,
  targetPlan,
}: {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  slug: string;
  currentPlan: string;
  targetPlan: string;
}) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`${businessName} veut passer au plan ${targetPlan}`}</Preview>
      <Body style={{ backgroundColor: "#f3f4f6", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ margin: "0 auto", padding: "24px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "18px", color: "#111827" }}>
            Demande de passage au plan {targetPlan}
          </Heading>
          <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
            <strong>Entreprise :</strong> {businessName} ({slug})
          </Text>
          <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
            <strong>Contact :</strong> {ownerName} · {email} · {phone}
          </Text>
          <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
          <Text style={{ fontSize: "14px", color: "#111827" }}>
            Passage souhaité : <strong>{currentPlan}</strong> →{" "}
            <strong>{targetPlan}</strong>
          </Text>
          <Text style={{ fontSize: "12px", color: "#9ca3af", marginTop: "16px" }}>
            Répondez à ce message pour organiser la mise à niveau et la facturation.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
