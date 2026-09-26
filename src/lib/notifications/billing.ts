import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { artisanProfiles } from "@/db/schema";
import { sendEmail } from "@/lib/email/send";
import { SubscriptionStartedEmail } from "@/lib/email/templates/subscription-started-email";
import { SubscriptionChangedEmail } from "@/lib/email/templates/subscription-changed-email";
import { SubscriptionCanceledEmail } from "@/lib/email/templates/subscription-canceled-email";
import { planById } from "@/lib/marketing/plans";
import { cancellationCause, type BillingTransition } from "@/lib/stripe/billing";
import { isUpgrade } from "@/lib/stripe/plans";
import { createNotification } from "./create";
import type { NotificationType } from "./types";

const SETTINGS_URL = "/dashboard/settings?tab=abonnement";

type InApp = { type: NotificationType; title: string; body: string };
type Email = { subject: string; react: React.ReactElement };

function inAppFor(t: BillingTransition, sub: Stripe.Subscription | null): InApp {
  switch (t.kind) {
    case "started": {
      const name = planById(t.plan).name;
      return {
        type: "billing.subscription_started",
        title: `Abonnement ${name} activé`,
        body: `Toutes les fonctionnalités du plan ${name} sont débloquées.`,
      };
    }
    case "changed": {
      const from = planById(t.from).name;
      const to = planById(t.to).name;
      return {
        type: "billing.subscription_changed",
        title: `Plan modifié : ${from} → ${to}`,
        body: isUpgrade(t.from, t.to)
          ? "Les nouvelles fonctionnalités sont disponibles."
          : `Les fonctionnalités du plan ${from} ne sont plus disponibles.`,
      };
    }
    case "canceled": {
      const from = planById(t.from).name;
      return {
        type: "billing.subscription_canceled",
        title: "Abonnement terminé : retour au plan Free",
        body:
          cancellationCause(sub) === "payment"
            ? `Le paiement de l'abonnement ${from} n'a pas abouti. Votre site et vos données restent accessibles.`
            : `Votre abonnement ${from} a pris fin. Votre site et vos données restent accessibles.`,
      };
    }
  }
}

function emailFor(
  t: BillingTransition,
  businessName: string,
  sub: Stripe.Subscription | null
): Email {
  switch (t.kind) {
    case "started":
      return {
        subject: `Votre abonnement Traballo ${planById(t.plan).name} est actif`,
        react: SubscriptionStartedEmail({ businessName, plan: t.plan }),
      };
    case "changed":
      return {
        subject: `Votre abonnement Traballo passe au plan ${planById(t.to).name}`,
        react: SubscriptionChangedEmail({ businessName, from: t.from, to: t.to }),
      };
    case "canceled":
      return {
        subject: "Votre abonnement Traballo est terminé",
        react: SubscriptionCanceledEmail({
          businessName,
          from: t.from,
          cause: cancellationCause(sub),
        }),
      };
  }
}

/**
 * Tell the artisan their subscription changed: e-mail to the profile's
 * business address + in-app notice. Called once per transition by the Stripe
 * webhook (see `syncSubscriptionToTenant`).
 *
 * Best-effort, never throws: the plan is already applied, and a webhook
 * retry would not see the transition again anyway.
 */
export async function notifyBillingTransition(
  tenantId: string,
  transition: BillingTransition,
  sub: Stripe.Subscription | null
): Promise<void> {
  try {
    const [profile] = await db
      .select({
        email: artisanProfiles.email,
        businessName: artisanProfiles.businessName,
      })
      .from(artisanProfiles)
      .where(eq(artisanProfiles.tenantId, tenantId))
      .limit(1);

    if (profile?.email) {
      const res = await sendEmail({
        to: profile.email,
        ...emailFor(transition, profile.businessName, sub),
      });
      if ("error" in res && res.error) {
        console.error("notifyBillingTransition: email not sent", res.error);
      }
    }
  } catch (err) {
    console.error("notifyBillingTransition: email failed", err);
  }

  await createNotification({
    tenantId,
    ...inAppFor(transition, sub),
    actionUrl: SETTINGS_URL,
  });
}
