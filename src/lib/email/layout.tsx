import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EMAIL_BRAND as B } from "./brand";

/* ------------------------------------------------------------------ */
/* Shell — branded header + professional signature, used by every mail */
/* ------------------------------------------------------------------ */

export function EmailLayout({
  preview,
  heading,
  children,
  footnote,
  signature,
}: {
  preview: string;
  heading?: string;
  children: React.ReactNode;
  /** Extra fine-print line above the copyright (e.g. security notice). */
  footnote?: string;
  /** Overrides the default "L'équipe Traballo" sign-off (e.g. for invoices). */
  signature?: { name: string; tagline?: string };
}) {
  const year = new Date().getFullYear();
  const sig = signature ?? { name: "L'équipe Traballo", tagline: `${B.tagline} · ${B.regions}` };

  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          {/* header */}
          <Section style={s.header}>
            <table role="presentation" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle", paddingRight: 10 }}>
                    <Img
                      src={B.logoUrl}
                      width="34"
                      height="34"
                      alt="Traballo"
                      style={{ borderRadius: 8, display: "block" }}
                    />
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <span style={s.wordmark}>Traballo</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* card */}
          <Section style={s.card}>
            {heading ? <Heading style={s.h1}>{heading}</Heading> : null}
            {children}
          </Section>

          {/* signature */}
          <Section style={s.footer}>
            <Text style={s.sigName}>{sig.name}</Text>
            {sig.tagline ? <Text style={s.sigTag}>{sig.tagline}</Text> : null}
            <Text style={s.links}>
              <Link href={B.site} style={s.link}>
                traballo.pro
              </Link>
              {"  ·  "}
              <Link href={`${B.app}/dashboard`} style={s.link}>
                Tableau de bord
              </Link>
              {"  ·  "}
              <Link href={`mailto:${B.supportEmail}`} style={s.link}>
                Aide
              </Link>
            </Text>
            <Hr style={s.hr} />
            {footnote ? <Text style={s.fine}>{footnote}</Text> : null}
            <Text style={s.fine}>
              © {year} Traballo. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ------------------------------------------------------------------ */
/* Content building blocks                                             */
/* ------------------------------------------------------------------ */

export function P({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <Text style={muted ? s.pMuted : s.p}>{children}</Text>;
}

export function Btn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "24px 0" }}>
      <tbody>
        <tr>
          <td style={s.btnTd}>
            <Link href={href} style={s.btn}>
              {children}
            </Link>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Key / value rows for notification emails. */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Text style={s.field}>
      <span style={s.fieldLabel}>{label}</span>
      <br />
      {children}
    </Text>
  );
}

export function Quote({ children }: { children: React.ReactNode }) {
  return <div style={s.quote}>{children}</div>;
}

export function Divider() {
  return <Hr style={s.hr} />;
}

/* ------------------------------------------------------------------ */

const s = {
  body: {
    backgroundColor: B.page,
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    margin: 0,
    padding: "24px 0",
  } as React.CSSProperties,
  container: {
    margin: "0 auto",
    maxWidth: "560px",
    padding: "0 16px",
  } as React.CSSProperties,
  header: { padding: "4px 4px 16px" } as React.CSSProperties,
  wordmark: {
    fontSize: "19px",
    fontWeight: 700,
    color: B.ink,
    letterSpacing: "-0.3px",
  } as React.CSSProperties,
  card: {
    backgroundColor: B.surface,
    border: `1px solid ${B.border}`,
    borderRadius: "14px",
    padding: "28px",
  } as React.CSSProperties,
  h1: {
    fontSize: "20px",
    fontWeight: 700,
    color: B.ink,
    margin: "0 0 12px",
    lineHeight: 1.3,
  } as React.CSSProperties,
  p: {
    fontSize: "15px",
    lineHeight: "24px",
    color: B.body,
    margin: "0 0 12px",
  } as React.CSSProperties,
  pMuted: {
    fontSize: "13px",
    lineHeight: "20px",
    color: B.muted,
    margin: "0 0 8px",
  } as React.CSSProperties,
  btnTd: {
    backgroundColor: B.blue,
    borderRadius: "10px",
  } as React.CSSProperties,
  btn: {
    display: "inline-block",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#ffffff",
    textDecoration: "none",
  } as React.CSSProperties,
  field: {
    fontSize: "14px",
    lineHeight: "20px",
    color: B.ink,
    margin: "0 0 12px",
  } as React.CSSProperties,
  fieldLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: B.muted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.4px",
  } as React.CSSProperties,
  quote: {
    borderLeft: `3px solid ${B.blue}`,
    padding: "4px 0 4px 14px",
    margin: "12px 0",
    fontSize: "14px",
    lineHeight: "22px",
    color: B.ink,
    whiteSpace: "pre-wrap" as const,
  } as React.CSSProperties,
  hr: {
    borderColor: B.border,
    borderStyle: "solid",
    borderWidth: "0 0 1px",
    margin: "16px 0",
  } as React.CSSProperties,
  footer: { padding: "20px 8px 8px" } as React.CSSProperties,
  sigName: {
    fontSize: "14px",
    fontWeight: 600,
    color: B.ink,
    margin: "0 0 2px",
  } as React.CSSProperties,
  sigTag: {
    fontSize: "12px",
    color: B.muted,
    margin: "0 0 8px",
  } as React.CSSProperties,
  links: { fontSize: "12px", color: B.muted, margin: 0 } as React.CSSProperties,
  link: { color: B.blue, textDecoration: "none" } as React.CSSProperties,
  fine: {
    fontSize: "11px",
    lineHeight: "16px",
    color: B.faint,
    margin: "0 0 4px",
  } as React.CSSProperties,
};

export { s as emailStyles };
