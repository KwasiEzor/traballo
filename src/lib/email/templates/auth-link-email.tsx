/**
 * Transactional auth email — magic link, email verification, password reset.
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import type { EmailMascotPose } from "@/lib/email/mascot";

interface AuthLinkEmailProps {
  heading: string;
  intro: string;
  cta: string;
  url: string;
  footer?: string;
  /** Reserve for a genuine emotional moment (email verification's welcome
      tone) — leave unset for password reset / magic link, which are
      security-utility moments, not celebrations. */
  mascotPose?: EmailMascotPose;
}

export function AuthLinkEmail({
  heading,
  intro,
  cta,
  url,
  footer = "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail — aucune action ne sera effectuée.",
  mascotPose,
}: AuthLinkEmailProps) {
  return (
    <EmailLayout preview={intro} heading={heading} mascotPose={mascotPose} footnote={footer}>
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
