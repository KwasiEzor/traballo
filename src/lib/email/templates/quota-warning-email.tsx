/**
 * A plan-bound usage quota is close to its limit → the artisan.
 * No trigger wires this yet — the only metered quota today (SMS, Phase 6
 * of NOTIFICATIONS_PLAN.md) doesn't exist. Built ahead so the caller only
 * needs to supply numbers once the quota exists.
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";

export function QuotaWarningEmail({
  businessName,
  quotaLabel,
  used,
  limit,
}: {
  businessName: string;
  /** e.g. "SMS" */
  quotaLabel: string;
  used: number;
  limit: number;
}) {
  return (
    <EmailLayout
      preview={`${businessName} approche de sa limite de ${quotaLabel} ce mois-ci.`}
      heading="Vous approchez de votre quota"
    >
      <P>Bonjour,</P>
      <P>
        <strong>{businessName}</strong> a utilisé{" "}
        <strong>
          {used} {quotaLabel}
        </strong>{" "}
        sur les {limit} inclus ce mois-ci.
      </P>
      <Btn href={`${B.app}/dashboard/settings?tab=abonnement`}>
        Voir mon abonnement
      </Btn>
      <P muted>Une question ? Écrivez à {B.supportEmail}.</P>
    </EmailLayout>
  );
}

export default QuotaWarningEmail;
