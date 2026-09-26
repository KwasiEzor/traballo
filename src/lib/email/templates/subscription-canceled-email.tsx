/**
 * The paid subscription ended (cancelled by the artisan, or unpaid after
 * Stripe's retries) → the tenant is back on Free.
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";
import { planById } from "@/lib/marketing/plans";
import type { PaidPlan } from "@/lib/stripe/plans";

export function SubscriptionCanceledEmail({
  businessName,
  from,
  cause,
}: {
  businessName: string;
  from: PaidPlan;
  cause: "requested" | "payment";
}) {
  const fromName = planById(from).name;
  return (
    <EmailLayout
      preview="Votre compte Traballo est repassé au plan Free."
      heading="Votre abonnement est terminé"
      mascotPose={cause === "payment" ? "error" : undefined}
    >
      <P>Bonjour,</P>
      {cause === "payment" ? (
        <P>
          Malgré plusieurs tentatives, le paiement de l&apos;abonnement{" "}
          {fromName} de <strong>{businessName}</strong> n&apos;a pas abouti :
          votre compte est repassé au <strong>plan Free</strong>.
        </P>
      ) : (
        <P>
          L&apos;abonnement {fromName} de <strong>{businessName}</strong> a pris
          fin : votre compte est repassé au <strong>plan Free</strong>.
        </P>
      )}
      <P>
        Votre site, vos clients et vos factures restent accessibles. Les
        fonctionnalités du plan {fromName} sont désactivées.
      </P>
      <Btn href={`${B.app}/dashboard/settings?tab=abonnement`}>
        Reprendre un abonnement
      </Btn>
      <P muted>Une question ? Écrivez à {B.supportEmail}.</P>
    </EmailLayout>
  );
}

export default SubscriptionCanceledEmail;
