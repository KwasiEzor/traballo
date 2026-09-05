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
        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-border bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                !yearly
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                yearly
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annuel
              <span className="rounded-full bg-success-subtle px-1.5 py-0.5 text-[11px] font-semibold text-success">
                −2 mois
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = yearly ? plan.priceYearly : plan.priceMonthly;
          const yearlySaving =
            plan.priceMonthly > 0
              ? plan.priceMonthly * 12 - plan.priceYearly * 12
              : 0;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
                plan.featured
                  ? "border-primary shadow-glow lg:-mt-3 lg:pt-8"
                  : "border-border"
              )}
            >
              {plan.featured && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-blueprint opacity-[0.35] [mask-image:radial-gradient(ellipse_70%_45%_at_50%_0%,black,transparent)]"
                />
              )}
              <div className="relative flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                {plan.featured && <Badge>Le plus choisi</Badge>}
              </div>
              <p className="relative mt-1.5 text-sm text-muted-foreground">
                {plan.tagline}
              </p>

              <div className="relative mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold tracking-tight text-foreground">
                  {price === 0 ? "0 €" : `${price} €`}
                </span>
                {price !== 0 && (
                  <span className="text-sm text-muted-foreground">/ mois</span>
                )}
              </div>
              <p className="relative mt-1 h-4 text-xs text-muted-foreground">
                {price === 0
                  ? "gratuit pour toujours"
                  : yearly
                    ? `soit ${price * 12} € / an — vous économisez ${yearlySaving} €`
                    : "sans engagement, résiliable à tout moment"}
              </p>

              <Button
                asChild
                className="relative mt-5"
                variant={plan.featured ? "primary" : "outline"}
                size="lg"
              >
                <a href={`${APP_URL}/auth/signup?plan=${plan.id}`}>{plan.cta}</a>
              </Button>

              <ul className="relative mt-6 space-y-3 text-sm">
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
