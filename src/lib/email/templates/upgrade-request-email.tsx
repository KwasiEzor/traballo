/**
 * An artisan asking to change plan from the dashboard → Traballo admin.
 */
import * as React from "react";
import { EmailLayout, P, Field, Divider } from "@/lib/email/layout";

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

export function UpgradeRequestEmail({
  businessName,
  ownerName,
  email,
  phone,
  slug,
  currentPlan,
  targetPlan,
}: {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  slug: string;
  currentPlan: string;
  targetPlan: string;
}) {
  const target = PLAN_LABEL[targetPlan] ?? targetPlan;
  return (
    <EmailLayout
      preview={`${businessName} veut passer au plan ${target}`}
      heading={`Demande de passage au plan ${target}`}
      footnote="Répondez à ce message pour organiser la mise à niveau et la facturation."
    >
      <Field label="Entreprise">
        {businessName} — {slug}.traballo.pro
      </Field>
      <Field label="Contact">
        {ownerName} · {email} · {phone}
      </Field>
      <Divider />
      <P>
        Plan actuel : <strong>{PLAN_LABEL[currentPlan] ?? currentPlan}</strong>
        {" → "}
        souhaité : <strong>{target}</strong>
      </P>
    </EmailLayout>
  );
}

export default UpgradeRequestEmail;
