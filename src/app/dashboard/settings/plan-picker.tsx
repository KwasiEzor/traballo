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

const ORDER = { free: 0, pro: 1, business: 2 } as const;
const initial: UpgradeState = {};

export function PlanPicker({
  currentPlan,
  marketingUrl,
}: {
  currentPlan: "free" | "pro" | "business" | string;
  marketingUrl: string;
}) {
  const [state, action, pending] = useActionState(requestUpgrade, initial);
  const [requested, setRequested] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (state.ok) toast.success("Demande envoyée. L'équipe vous recontacte vite.");
    if (state.error) toast.error(state.error);
  }, [state]);

  const currentRank = ORDER[currentPlan as keyof typeof ORDER] ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const rank = ORDER[p.id];
          const isCurrent = p.id === currentPlan;
          const isUpgrade = rank > currentRank;
          const done = state.ok && requested === p.id;

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
                  {p.priceMonthly === 0 ? "0 €" : `${p.priceMonthly} €`}
                </span>
                {p.priceMonthly !== 0 && (
                  <span className="text-xs text-muted-foreground">/ mois</span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>

              <ul className="mt-3 flex-1 space-y-1.5">
                {p.highlights
                  .filter((h) => !h.endsWith(":"))
                  .slice(0, 5)
                  .map((h) => (
                    <li
                      key={h}
                      className="flex gap-2 text-xs text-muted-foreground"
                    >
                      <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                      {h}
                    </li>
                  ))}
              </ul>

              {isUpgrade && (
                <form action={action} className="mt-4">
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
                      disabled={pending}
                      onClick={() => setRequested(p.id)}
                    >
                      {pending && requested === p.id
                        ? "Envoi…"
                        : `Passer à ${p.name}`}
                    </Button>
                  )}
                </form>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Le paiement en ligne (Stripe) arrive bientôt. En attendant, votre demande
        est transmise à l&apos;équipe qui organise la mise à niveau.{" "}
        <Link
          href={`${marketingUrl}/tarifs`}
          target="_blank"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Comparer les plans en détail
          <ExternalLink className="size-3" />
        </Link>
      </p>
    </div>
  );
}
