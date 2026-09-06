/**
 * Sent once, right after a new artisan confirms their e-mail address.
 */
import * as React from "react";
import { EmailLayout, P, Btn, Divider } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";

export function WelcomeEmail({ firstName }: { firstName?: string }) {
  const hello = firstName ? `Bonjour ${firstName},` : "Bonjour,";
  return (
    <EmailLayout
      preview="Votre compte Traballo est prêt — voici comment démarrer."
      heading="Bienvenue sur Traballo 👋"
    >
      <P>{hello}</P>
      <P>
        Votre compte est activé. En quelques minutes, vous pouvez avoir votre
        site en ligne et envoyer votre première facture conforme.
      </P>
      <Divider />
      <P>
        <strong>1. Personnalisez votre site</strong>
        <br />
        Métier, zone d&apos;intervention, couleurs, logo — puis publiez.
      </P>
      <P>
        <strong>2. Créez une facture</strong>
        <br />
        Un formulaire simple, le format Factur-X géré pour vous.
      </P>
      <P>
        <strong>3. Ajoutez vos clients et vos disponibilités</strong>
        <br />
        Pour les devis, les relances et la prise de rendez-vous.
      </P>
      <Btn href={`${B.app}/dashboard`}>Ouvrir mon tableau de bord</Btn>
      <P muted>
        Une question ? Répondez à cet e-mail ou écrivez à {B.supportEmail}.
      </P>
    </EmailLayout>
  );
}

export default WelcomeEmail;
