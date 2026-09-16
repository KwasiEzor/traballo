"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/marketing/plans";
import { APP_URL } from "@/lib/marketing/nav";
import { TiltCard } from "@/components/motion/tilt-card";
import { DraftBorder } from "@/components/motion/draft-border";
import { DrawnCheck } from "@/components/motion/drawn-check";
import { OdometerNumber } from "@/components/motion/odometer-number";

export function PricingTiers({ withToggle = true }: { withToggle?: boolean }) {
  const [yearly, setYearly] = React.useState(true);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [parallaxEnabled, setParallaxEnabled] = React.useState(false);

  React.useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setParallaxEnabled(fine && !reduced);
  }, []);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 120, damping: 22, mass: 0.6 };
  const bgX = useSpring(useTransform(mx, [0, 1], [-14, 14]), spring);
  const bgY = useSpring(useTransform(my, [0, 1], [-14, 14]), spring);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!parallaxEnabled || !sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function onMouseLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <div
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative"
    >
      {parallaxEnabled && (
        <motion.div
          aria-hidden="true"
          className="bg-blueprint pointer-events-none absolute -inset-10 opacity-[0.35] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_15%,black,transparent)]"
          style={{ x: bgX, y: bgY }}
        />
      )}

      {withToggle && (
        <div className="relative mb-12 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-border bg-muted/60 p-1">
            {(
              [
                { key: "monthly", label: "Mensuel", active: !yearly },
                { key: "yearly", label: "Annuel", active: yearly },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setYearly(opt.key === "yearly")}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  opt.active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.active && (
                  <motion.span
                    layoutId="pricing-toggle-pill"
                    className="absolute inset-0 rounded-full bg-card shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}
                <span className="relative">{opt.label}</span>
                {opt.key === "yearly" && (
                  <motion.span
                    initial={false}
                    animate={
                      yearly ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0.7 }
                    }
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="relative rounded-full bg-success-subtle px-1.5 py-0.5 text-[11px] font-semibold text-success"
                  >
                    −2 mois
                  </motion.span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.16fr_1fr] lg:gap-7">
        {PLANS.map((plan, index) => {
          const price = yearly ? plan.priceYearly : plan.priceMonthly;
          const yearlySaving =
            plan.priceMonthly > 0
              ? plan.priceMonthly * 12 - plan.priceYearly * 12
              : 0;

          const card = (
            <div
              className={cn(
                "relative flex h-full flex-col rounded-2xl bg-card p-6 shadow-sm transition-shadow duration-300",
                plan.featured
                  ? "shadow-glow hover:shadow-glow-lg lg:-mt-8 lg:p-9"
                  : "hover:shadow-glow-soft"
              )}
            >
              <DraftBorder
                radius={16}
                delay={index * 0.15}
                duration={plan.featured ? 1.4 : 1}
                strokeWidth={plan.featured ? 2 : 1.5}
                className={
                  plan.featured
                    ? "text-primary"
                    : "text-border transition-colors duration-300 group-hover:text-primary/55"
                }
              />

              {plan.featured && (
                <>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-2xl bg-blueprint opacity-[0.35] [mask-image:radial-gradient(ellipse_70%_45%_at_50%_0%,black,transparent)]"
                  />
                  <FeaturedBadge />
                </>
              )}

              <h3
                className={cn(
                  "relative font-display font-semibold text-foreground",
                  plan.featured ? "text-xl" : "text-lg"
                )}
              >
                {plan.name}
              </h3>
              <p className="relative mt-1.5 text-sm text-muted-foreground">
                {plan.tagline}
              </p>

              <div className="relative mt-5 flex items-baseline gap-1">
                {price === 0 ? (
                  <span
                    className={cn(
                      "font-display font-semibold tracking-tight text-foreground",
                      plan.featured ? "text-5xl" : "text-4xl"
                    )}
                  >
                    0 €
                  </span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex items-baseline font-display font-semibold tracking-tight text-foreground",
                      plan.featured ? "text-5xl" : "text-4xl"
                    )}
                  >
                    <OdometerNumber value={price} />
                    <span>&nbsp;€</span>
                  </span>
                )}
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
                className={cn("relative mt-5 overflow-hidden", plan.featured && "group")}
                variant={plan.featured ? "primary" : "outline"}
                size="lg"
              >
                <a href={`${APP_URL}/auth/signup?plan=${plan.id}`}>
                  {plan.featured && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                    />
                  )}
                  <span className="relative">{plan.cta}</span>
                </a>
              </Button>

              <ul className="relative mt-6 space-y-3 text-sm">
                {plan.highlights.map((h, hIndex) => {
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
                        <DrawnCheck
                          delay={index * 0.15 + hIndex * 0.05}
                          className="mt-0.5 text-primary"
                        />
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

          return (
            <div key={plan.id} className={cn(plan.featured && "lg:z-10")}>
              <TiltCard>{card}</TiltCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Overlaps the top edge of the featured card, centered, so it reads as
 * "the one to pick" at a glance regardless of viewport width — instead of
 * competing for space inside the card header, where it could get lost or
 * wrap awkwardly on narrow screens.
 */
function FeaturedBadge() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, scale: 0.6, y: 8 }}
      whileInView={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.3 }}
      className="absolute -top-4 left-1/2 z-20 -translate-x-1/2"
    >
      <span className="inline-flex items-center whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-glow">
        Le plus choisi
      </span>
    </motion.div>
  );
}
