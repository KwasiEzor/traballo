/**
 * A paid subscription just started → the artisan.
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";
import { planById } from "@/lib/marketing/plans";
import type { PaidPlan } from "@/lib/stripe/plans";

export function SubscriptionStartedEmail({
  businessName,
  plan,
}: {
  businessName: string;
  plan: PaidPlan;
}) {
  const { name, highlights } = planById(plan);
  return (
    <EmailLayout
      preview={`Votre abonnement Traballo ${name} est actif.`}
      heading={`Bienvenue dans le plan ${name}`}
      mascotPose="welcome"
    >
      <P>Bonjour,</P>
      <P>
        L&apos;abonnement de <strong>{businessName}</strong> est actif : le{" "}
        <strong>plan {name}</strong> est débloqué dès maintenant.
      </P>
      <P>
        {highlights
          .filter((h) => !h.endsWith(":"))
          .map((h) => (
            <React.Fragment key={h}>
              ✓ {h}
              <br />
            </React.Fragment>
          ))}
      </P>
      <Btn href={`${B.app}/dashboard`}>Ouvrir mon tableau de bord</Btn>
      <P muted>
        Factures d&apos;abonnement, moyen de paiement et résiliation : Paramètres
        → Abonnement. Une question ? Écrivez à {B.supportEmail}.
      </P>
    </EmailLayout>
  );
}

export default SubscriptionStartedEmail;
