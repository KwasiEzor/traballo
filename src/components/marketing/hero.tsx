"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck, MapPin, FileCheck2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductFrame } from "@/components/marketing/product-frame";
import { GrainGradient } from "@/components/marketing/grain-gradient";
import { DimensionMark } from "@/components/marketing/dimension-mark";
import { DashboardMock } from "@/components/marketing/mockups";
import { HeroChatDemo } from "@/components/marketing/hero-chat-demo";
import { Mascot } from "@/components/shared/mascot";
import { APP_URL } from "@/lib/marketing/nav";

const trust = [
  { icon: MapPin, label: "Données hébergées en Europe" },
  { icon: FileCheck2, label: "Factur-X & PEPPOL" },
  { icon: ShieldCheck, label: "Sans engagement" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/** A copper highlighter stroke drawn under a key phrase — the headline's
 * one deliberate nod to the mascot's warm palette, not just brand-blue.
 * A hand-drawn SVG blob (not a plain rectangle) so it reads as a marker
 * stroke, not a stray colour artifact. */
function Highlight({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <motion.div
        aria-hidden="true"
        className="absolute -inset-x-2 -z-0 h-[0.6em] origin-left"
        style={{ bottom: "-0.05em" }}
        initial={reduced ? undefined : { scaleX: 0, rotate: -1 }}
        animate={reduced ? undefined : { scaleX: 1, rotate: -1 }}
        transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
      >
        <svg viewBox="0 0 120 20" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0,5 C15,2 30,7 45,4 C60,1 75,6 90,3 C100,1 110,4 120,3 L120,17 C108,20 95,15 80,18 C65,21 50,16 35,19 C20,22 8,18 0,19 Z"
            className="fill-copper"
          />
        </svg>
      </motion.div>
    </span>
  );
}

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border">
      <GrainGradient />

      <div className="container-page relative pt-10 pb-8 sm:pt-24 sm:pb-28">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-10 xl:gap-12">
          {/* Copy — left-aligned, editorial rather than centered-and-stacked.
              min-w-0 overrides the grid item's default min-width:auto, which
              would otherwise let the nowrap buttons/badge force this track
              wider than the viewport on narrow screens. */}
          <div className="min-w-0">
            <motion.div
              initial={reduced ? undefined : { opacity: 0, y: 10 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <DimensionMark label="Artisans FR · BE · LU" className="mb-5 hidden sm:inline-flex" />
              <Badge variant="outline" className="w-fit bg-card/80 backdrop-blur-sm">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                Facturation électronique obligatoire dès 2026
              </Badge>
            </motion.div>

            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl">
              <motion.span
                className="block"
                initial={reduced ? undefined : { opacity: 0, y: 24 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              >
                Tout votre
              </motion.span>
              <motion.span
                className="block"
                initial={reduced ? undefined : { opacity: 0, y: 24 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.19, ease: EASE }}
              >
                <Highlight>business d&apos;artisan.</Highlight>
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-primary to-copper bg-clip-text text-transparent"
                initial={reduced ? undefined : { opacity: 0, y: 24 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
              >
                Un seul tableau
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-primary to-copper bg-clip-text text-transparent"
                initial={reduced ? undefined : { opacity: 0, y: 24 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.34, ease: EASE }}
              >
                de bord.
              </motion.span>
            </h1>

            <motion.p
              className="mt-5 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground"
              initial={reduced ? undefined : { opacity: 0, y: 14 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
            >
              Site web professionnel, factures conformes Factur-X, agent IA qui
              répond à vos clients 24&nbsp;h/24 et rendez-vous automatisés. Prêt en
              30&nbsp;minutes, à partir de&nbsp;0&nbsp;€.
            </motion.p>

            <motion.div
              className="mt-6 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center"
              initial={reduced ? undefined : { opacity: 0, y: 14 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
            >
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href={`${APP_URL}/auth/signup`}>
                  Commencer gratuitement
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full bg-card/70 backdrop-blur-sm sm:w-auto">
                <Link href="/tarifs">Voir les tarifs</Link>
              </Button>
            </motion.div>

            <motion.ul
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground sm:mt-8"
              initial={reduced ? undefined : { opacity: 0 }}
              animate={reduced ? undefined : { opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {trust.map((t) => (
                <li key={t.label} className="flex items-center gap-2">
                  <t.icon className="size-4 text-primary" />
                  {t.label}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Visual collage — a tilted pinboard, not a centered browser mock.
              Deliberately two elements (mascot + frame) plus one supporting
              card, not five competing stickers. */}
          <motion.div
            className="relative mx-auto w-full max-w-sm pt-2 pb-6 sm:max-w-md sm:pt-6 sm:pb-10 lg:mx-0 lg:max-w-none lg:pt-2"
            initial={reduced ? undefined : { opacity: 0, y: 30 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
          >
            {/* washi-tape strip pinning the mascot to the board — striped so
                it reads as tape, and high enough to actually peek past the
                mascot instead of hiding behind it. */}
            <div
              aria-hidden="true"
              className="absolute left-9 -top-2 h-8 w-24 -rotate-6 rounded-[2px] shadow-sm sm:left-12 sm:-top-3"
              style={{
                background:
                  "repeating-linear-gradient(45deg, color-mix(in oklch, var(--copper) 55%, transparent) 0 6px, color-mix(in oklch, var(--copper) 25%, transparent) 6px 12px)",
              }}
            />

            <motion.div
              className="absolute -left-1 top-0 z-20 sm:left-2"
              initial={reduced ? undefined : { opacity: 0, scale: 0.85, rotate: -6, y: -8 }}
              animate={reduced ? undefined : { opacity: 1, scale: 1, rotate: -4, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
            >
              <div className="rotate-[-4deg]">
                <Mascot pose="welcome" size={112} className="drop-shadow-xl" />
              </div>
            </motion.div>

            <motion.div
              className="relative z-10 mt-14 rotate-2 sm:mt-20 lg:mt-24"
              initial={reduced ? undefined : { opacity: 0, y: 30, rotate: 5 }}
              animate={reduced ? undefined : { opacity: 1, y: 0, rotate: 2 }}
              transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
            >
              <ProductFrame designWidth={600} className="shadow-glow">
                <DashboardMock />
              </ProductFrame>

              {/* "online" tag anchored to the frame itself — a badge that
                  belongs to the product, not a pill floating in empty space */}
              <motion.div
                className="absolute -top-3 -right-3 z-20 flex items-center gap-1.5 rounded-full border border-copper/30 bg-copper-subtle px-2.5 py-1 text-[11px] font-medium text-copper shadow-sm"
                initial={reduced ? undefined : { opacity: 0, scale: 0.9 }}
                animate={reduced ? undefined : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.1, ease: EASE }}
              >
                <Sparkles className="size-3 shrink-0" />
                Agent IA en ligne
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute -bottom-6 -left-4 z-20 w-48 -rotate-3 rounded-lg border border-border bg-card shadow-lg sm:-left-8 sm:w-52"
              initial={reduced ? undefined : { opacity: 0, y: 20, x: -10, rotate: -8 }}
              animate={reduced ? undefined : { opacity: 1, y: 0, x: 0, rotate: -3 }}
              transition={{ duration: 0.7, delay: 1.05, ease: EASE }}
            >
              <HeroChatDemo />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
