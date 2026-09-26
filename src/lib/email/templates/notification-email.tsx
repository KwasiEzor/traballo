/**
 * Generic notice → the artisan, for notification types whose e-mail channel
 * goes through `createNotification` (and so through the artisan's
 * preferences). Mirrors the in-app notice: heading, body, link.
 */
import * as React from "react";
import { EmailLayout, P, Btn } from "@/lib/email/layout";
import { EMAIL_BRAND as B } from "@/lib/email/brand";

export function NotificationEmail({
  heading,
  body,
  actionUrl,
  cta = "Ouvrir Traballo",
}: {
  heading: string;
  body?: string;
  /** Dashboard path (`/dashboard/...`). */
  actionUrl?: string;
  cta?: string;
}) {
  return (
    <EmailLayout
      preview={heading}
      heading={heading}
      footnote="Vous recevez cet e-mail selon vos préférences de notification (Paramètres → Notifications)."
    >
      {body ? <P>{body}</P> : null}
      {actionUrl ? <Btn href={`${B.app}${actionUrl}`}>{cta}</Btn> : null}
    </EmailLayout>
  );
}

export default NotificationEmail;
