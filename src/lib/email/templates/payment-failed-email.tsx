/**
 * A subscription payment failed → the artisan.
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";

export function PaymentFailedEmail({
  businessName,
  amountDue,
  portalHint,
}: {
  businessName: string;
  amountDue?: string;
  portalHint?: boolean;
}) {
  return (
    <EmailLayout
      preview="Le paiement de votre abonnement Traballo a échoué."
      heading="Paiement échoué"
      footnote="Sans régularisation, votre compte repassera automatiquement au plan Free. Votre site et vos factures restent accessibles."
    >
      <P>Bonjour,</P>
      <P>
        Le paiement de l&apos;abonnement Traballo de{" "}
        <strong>{businessName}</strong>
        {amountDue ? ` (${amountDue})` : ""} n&apos;a pas abouti — souvent une
        carte expirée ou un plafond atteint.
      </P>
      <P>
        Mettez à jour votre moyen de paiement pour éviter toute interruption.
        Nous représentons automatiquement le paiement plusieurs fois.
      </P>
      {portalHint ? (
        <Btn href={`${B.app}/dashboard/settings?tab=abonnement`}>
          Mettre à jour le paiement
        </Btn>
      ) : null}
      <P muted>Une question ? Écrivez à {B.supportEmail}.</P>
    </EmailLayout>
  );
}

export default PaymentFailedEmail;
