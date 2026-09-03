"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/marketing/plans";
import { APP_URL } from "@/lib/marketing/nav";

export function PricingTiers({ withToggle = true }: { withToggle?: boolean }) {
  const [yearly, setYearly] = React.useState(true);

  return (
    <div>
      {withToggle && (
        <div className="mb-10 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Annuel
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px]",
                yearly ? "bg-primary-foreground/15 text-primary-foreground" : "bg-success-subtle text-success"
              )}
            >
              −2 mois
            </span>
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = yearly ? plan.priceYearly : plan.priceMonthly;
          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
                plan.featured
                  ? "border-primary ring-1 ring-primary shadow-lg"
                  : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                {plan.featured && <Badge>Le plus choisi</Badge>}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{plan.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold tracking-tight text-foreground">
                  {price === 0 ? "0 €" : `${price} €`}
                </span>
                {price !== 0 && (
                  <span className="text-sm text-muted-foreground">/ mois</span>
                )}
              </div>
              <p className="mt-1 h-4 text-xs text-muted-foreground">
                {price !== 0 && yearly ? `soit ${price * 12} € / an, facturé annuellement` : price !== 0 ? "sans engagement" : "pour toujours"}
              </p>

              <Button
                asChild
                className="mt-5"
                variant={plan.featured ? "primary" : "outline"}
                size="lg"
              >
                <a href={`${APP_URL}/auth/signup?plan=${plan.id}`}>{plan.cta}</a>
              </Button>

              <ul className="mt-6 space-y-3 text-sm">
                {plan.highlights.map((h) => {
                  const isHeader = h.endsWith(":");
                  return (
                    <li
                      key={h}
                      className={cn(
                        "flex gap-2.5",
                        isHeader && "font-medium text-foreground"
                      )}
                    >
                      {!isHeader && (
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      )}
                      <span className={cn(!isHeader && "text-muted-foreground")}>
                        {h}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
