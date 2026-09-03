/**
 * src/lib/email/templates/auth-link-email.tsx
 * Minimal transactional email for auth links (magic link, email verification,
 * password reset).
 */

import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface AuthLinkEmailProps {
  heading: string;
  intro: string;
  cta: string;
  url: string;
  footer?: string;
}

export function AuthLinkEmail({
  heading,
  intro,
  cta,
  url,
  footer = "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
}: AuthLinkEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{intro}</Preview>
      <Body style={{ backgroundColor: "#f3f4f6", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ margin: "0 auto", padding: "32px", maxWidth: "480px" }}>
          <Heading style={{ fontSize: "20px", color: "#111827" }}>{heading}</Heading>
          <Text style={{ fontSize: "14px", color: "#374151" }}>{intro}</Text>
          <Button
            href={url}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              borderRadius: "8px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            {cta}
          </Button>
          <Text style={{ fontSize: "12px", color: "#6b7280", marginTop: "24px" }}>
            {footer}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AuthLinkEmail;
