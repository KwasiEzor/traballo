/**
 * A paid tenant moved between paid plans (Pro ↔ Business) → the artisan.
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";

const PLAN_NAME: Record<"pro" | "business", string> = {
  pro: "Pro",
  business: "Business",
};

export function SubscriptionChangedEmail({
  businessName,
  previousPlan,
  newPlan,
}: {
  businessName: string;
  previousPlan: "pro" | "business";
  newPlan: "pro" | "business";
}) {
  const upgrade = newPlan === "business" && previousPlan === "pro";
  return (
    <EmailLayout
      preview={`Votre abonnement passe au plan ${PLAN_NAME[newPlan]}.`}
      heading={upgrade ? "Plan mis à niveau" : "Changement de plan"}
    >
      <P>Bonjour,</P>
      <P>
        L&apos;abonnement de <strong>{businessName}</strong> passe du plan{" "}
        {PLAN_NAME[previousPlan]} au plan <strong>{PLAN_NAME[newPlan]}</strong>
        . {upgrade
          ? "Les fonctionnalités supplémentaires sont disponibles dès maintenant."
          : "Certaines fonctionnalités du plan précédent ne sont plus accessibles."}
      </P>
      <Btn href={`${B.app}/dashboard/settings?tab=abonnement`}>
        Voir mon abonnement
      </Btn>
      <P muted>Une question ? Écrivez à {B.supportEmail}.</P>
    </EmailLayout>
  );
}

export default SubscriptionChangedEmail;
