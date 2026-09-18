/**
 * A tenant's first paid subscription became active → the artisan.
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";

const PLAN_NAME: Record<"pro" | "business", string> = {
  pro: "Pro",
  business: "Business",
};

export function SubscriptionStartedEmail({
  businessName,
  plan,
}: {
  businessName: string;
  plan: "pro" | "business";
}) {
  return (
    <EmailLayout
      preview={`Votre abonnement ${PLAN_NAME[plan]} est actif.`}
      heading="Bienvenue sur le plan"
      mascotPose="welcome"
    >
      <P>Bonjour,</P>
      <P>
        L&apos;abonnement <strong>{PLAN_NAME[plan]}</strong> de{" "}
        <strong>{businessName}</strong> est actif. Toutes les fonctionnalités
        du plan sont désormais disponibles sur votre tableau de bord.
      </P>
      <Btn href={`${B.app}/dashboard/settings?tab=abonnement`}>
        Voir mon abonnement
      </Btn>
      <P muted>Une question ? Écrivez à {B.supportEmail}.</P>
    </EmailLayout>
  );
}

export default SubscriptionStartedEmail;
