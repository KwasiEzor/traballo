"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/marketing/plans";
import { requestUpgrade, type UpgradeState } from "./actions/request-upgrade";
import { startCheckout, type BillingState } from "./actions/billing";

const ORDER = { free: 0, pro: 1, business: 2 } as const;
const initialUpgrade: UpgradeState = {};
const initialBilling: BillingState = {};

export function PlanPicker({
  currentPlan,
  marketingUrl,
  stripeEnabled,
}: {
  currentPlan: "free" | "pro" | "business" | string;
  marketingUrl: string;
  stripeEnabled: boolean;
}) {
  const [yearly, setYearly] = React.useState(false);

  const [upState, upAction, upPending] = useActionState(
    requestUpgrade,
    initialUpgrade
  );
  const [payState, payAction, payPending] = useActionState(
    startCheckout,
    initialBilling
  );
  const [pendingPlan, setPendingPlan] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (upState.ok) toast.success("Demande envoyée. L'équipe vous recontacte vite.");
    if (upState.error) toast.error(upState.error);
    if (payState.error) toast.error(payState.error);
  }, [upState, payState]);

  const currentRank = ORDER[currentPlan as keyof typeof ORDER] ?? 0;

  return (
    <div className="space-y-4">
      {stripeEnabled && (
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full border border-border bg-muted/60 p-1 text-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-3 py-1 font-medium transition-colors",
                !yearly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors",
                yearly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Annuel
              <span className="rounded-full bg-success-subtle px-1.5 text-[11px] font-semibold text-success">
                −2 mois
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const rank = ORDER[p.id];
          const isCurrent = p.id === currentPlan;
          const isUpgrade = rank > currentRank;
          const price = yearly ? p.priceYearly : p.priceMonthly;
          const done = upState.ok && pendingPlan === p.id;
          const busy =
            (payPending || upPending) && pendingPlan === p.id;

          return (
            <div
              key={p.id}
              className={cn(
                "flex flex-col rounded-xl border p-4",
                isCurrent
                  ? "border-primary bg-primary-subtle/40"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-foreground">
                  {p.name}
                </span>
                {isCurrent && <Badge>Votre plan</Badge>}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-2xl font-semibold text-foreground">
                  {price === 0 ? "0 €" : `${price} €`}
                </span>
                {price !== 0 && (
                  <span className="text-xs text-muted-foreground">/ mois</span>
                )}
              </div>
              <p className="mt-1 h-4 text-[11px] text-muted-foreground">
                {price !== 0 && yearly
                  ? `soit ${price * 12} € / an`
                  : price !== 0
                    ? "sans engagement"
                    : "pour toujours"}
              </p>

              <ul className="mt-3 flex-1 space-y-1.5">
                {p.highlights
                  .filter((h) => !h.endsWith(":"))
                  .slice(0, 5)
                  .map((h) => (
                    <li key={h} className="flex gap-2 text-xs text-muted-foreground">
                      <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                      {h}
                    </li>
                  ))}
              </ul>

              {isUpgrade &&
                (stripeEnabled ? (
                  <form action={payAction} className="mt-4">
                    <input type="hidden" name="plan" value={p.id} />
                    <input
                      type="hidden"
                      name="interval"
                      value={yearly ? "year" : "month"}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full"
                      disabled={busy}
                      onClick={() => setPendingPlan(p.id)}
                    >
                      {busy ? "Redirection…" : `Passer à ${p.name}`}
                    </Button>
                  </form>
                ) : (
                  <form action={upAction} className="mt-4">
                    <input type="hidden" name="plan" value={p.id} />
                    {done ? (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-success">
                        <CheckCircle2 className="size-4" />
                        Demande envoyée
                      </p>
                    ) : (
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full"
                        disabled={busy}
                        onClick={() => setPendingPlan(p.id)}
                      >
                        {busy ? "Envoi…" : `Passer à ${p.name}`}
                      </Button>
                    )}
                  </form>
                ))}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {stripeEnabled
          ? "Paiement sécurisé par Stripe. Changement de plan et résiliation à tout moment depuis « Gérer mon abonnement »."
          : "Le paiement en ligne arrive bientôt — votre demande est transmise à l'équipe en attendant."}{" "}
        <Link
          href={`${marketingUrl}/tarifs`}
          target="_blank"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Comparer les plans
          <ExternalLink className="size-3" />
        </Link>
      </p>
    </div>
  );
}
