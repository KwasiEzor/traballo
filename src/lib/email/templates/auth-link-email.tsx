/**
 * Transactional auth email — magic link, email verification, password reset.
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";

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
  footer = "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail — aucune action ne sera effectuée.",
}: AuthLinkEmailProps) {
  return (
    <EmailLayout preview={intro} heading={heading} footnote={footer}>
      <P>{intro}</P>
      <Btn href={url}>{cta}</Btn>
      <P muted>
        Ou copiez ce lien dans votre navigateur :<br />
        {url}
      </P>
    </EmailLayout>
  );
}

export default AuthLinkEmail;
