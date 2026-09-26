/**
 * The artisan moved to another paid plan (upgrade or downgrade).
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";
import { planById } from "@/lib/marketing/plans";
import { isUpgrade, type PaidPlan } from "@/lib/stripe/plans";

export function SubscriptionChangedEmail({
  businessName,
  from,
  to,
}: {
  businessName: string;
  from: PaidPlan;
  to: PaidPlan;
}) {
  const fromName = planById(from).name;
  const toName = planById(to).name;
  const upgrade = isUpgrade(from, to);
  return (
    <EmailLayout
      preview={`Votre abonnement Traballo passe au plan ${toName}.`}
      heading={`Votre plan passe à ${toName}`}
    >
      <P>Bonjour,</P>
      <P>
        L&apos;abonnement de <strong>{businessName}</strong> passe du plan{" "}
        {fromName} au <strong>plan {toName}</strong>.
      </P>
      {upgrade ? (
        <P>Les nouvelles fonctionnalités sont disponibles dès maintenant.</P>
      ) : (
        <P>
          Les fonctionnalités réservées au plan {fromName} ne sont plus
          disponibles. Votre site, vos clients et vos factures sont conservés.
        </P>
      )}
      <Btn href={`${B.app}/dashboard/settings?tab=abonnement`}>
        Voir mon abonnement
      </Btn>
      <P muted>Une question ? Écrivez à {B.supportEmail}.</P>
    </EmailLayout>
  );
}

export default SubscriptionChangedEmail;
