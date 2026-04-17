/**
 * Invoice email template using React Email
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface InvoiceEmailProps {
  invoiceNumber: string;
  clientName: string;
  total: string;
  dueDate: string;
  artisanBusinessName: string;
  pdfUrl?: string;
}

export function InvoiceEmail({
  invoiceNumber = "INV-0001",
  clientName = "John Doe",
  total = "1000.00",
  dueDate = "2024-01-31",
  artisanBusinessName = "Mon Entreprise",
  pdfUrl,
}: InvoiceEmailProps) {
  const formattedDueDate = new Date(dueDate).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Html>
      <Head />
      <Preview>
        Nouvelle facture {invoiceNumber} de {artisanBusinessName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nouvelle facture</Heading>

          <Text style={text}>Bonjour {clientName},</Text>

          <Text style={text}>
            Vous avez reçu une nouvelle facture de la part de{" "}
            <strong>{artisanBusinessName}</strong>.
          </Text>

          <Section style={invoiceBox}>
            <Text style={invoiceNumberStyle}>Facture {invoiceNumber}</Text>
            <Text style={invoiceAmount}>Montant : {total}€ TTC</Text>
            <Text style={invoiceDue}>
              À payer avant le {formattedDueDate}
            </Text>
          </Section>

          {pdfUrl && (
            <Section style={buttonContainer}>
              <Link href={pdfUrl} style={button}>
                📄 Télécharger la facture
              </Link>
            </Section>
          )}

          <Text style={text}>
            Si vous avez des questions concernant cette facture, n'hésitez pas à
            nous contacter.
          </Text>

          <Text style={footer}>
            Cordialement,
            <br />
            {artisanBusinessName}
          </Text>

          <Text style={footerNote}>
            Ce message a été envoyé automatiquement via Traballo.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const invoiceBox = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  margin: "32px 40px",
  padding: "24px",
  textAlign: "center" as const,
};

const invoiceNumberStyle = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 8px 0",
};

const invoiceAmount = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#1f2937",
  margin: "0 0 8px 0",
};

const invoiceDue = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0",
};

const buttonContainer = {
  padding: "0 40px",
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "32px",
};

const footerNote = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  padding: "0 40px",
  marginTop: "24px",
};

export default InvoiceEmail;
