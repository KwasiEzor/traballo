/**
 * A tenant's paid subscription ended → back to Free → the artisan.
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";

export function SubscriptionCanceledEmail({
  businessName,
}: {
  businessName: string;
}) {
  return (
    <EmailLayout
      preview="Votre abonnement Traballo est annulé — retour au plan Free."
      heading="Abonnement annulé"
    >
      <P>Bonjour,</P>
      <P>
        L&apos;abonnement payant de <strong>{businessName}</strong> a pris
        fin. Le compte repasse au plan Free : votre site et vos factures
        restent accessibles, mais les fonctionnalités du plan payant ne sont
        plus disponibles.
      </P>
      <Btn href={`${B.app}/dashboard/settings?tab=abonnement`}>
        Reprendre un abonnement
      </Btn>
      <P muted>Une question ? Écrivez à {B.supportEmail}.</P>
    </EmailLayout>
  );
}

export default SubscriptionCanceledEmail;
