"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { DimensionMark } from "@/components/marketing/dimension-mark";

const EASE = [0.16, 1, 0.3, 1] as const;

const QUICK_LINKS = [
  { href: "/fonctionnalites", label: "Fonctionnalités" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/contact", label: "Contact" },
];

export function NotFoundContent() {
  const reduced = useReducedMotion();
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: EASE },
        };

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-blueprint opacity-50 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_42%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grain opacity-[0.035] mix-blend-overlay"
      />

      <header className="container-page relative z-10 py-6">
        <Link href="/" aria-label="Traballo — accueil">
          <Logo />
        </Link>
      </header>

      <div className="container-page relative z-10 flex flex-1 flex-col items-center justify-center py-12 text-center sm:py-16">
        <motion.div {...rise(0)}>
          <DimensionMark label="Erreur 404" />
        </motion.div>

        <motion.p
          {...rise(0.06)}
          className="mt-6 font-display text-[clamp(4.5rem,17vw,9rem)] font-semibold leading-none tracking-tight text-foreground"
        >
          4
          <span style={{ WebkitTextStroke: "2px var(--primary)" }} className="text-transparent">
            0
          </span>
          4
        </motion.p>

        <motion.h1
          {...rise(0.12)}
          className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Cette page n&apos;existe pas
        </motion.h1>

        <motion.p
          {...rise(0.18)}
          className="mt-3 max-w-md text-pretty text-muted-foreground"
        >
          Le lien est peut-être incorrect, ou la page a été déplacée. Rien de
          grave — revenons en terrain connu.
        </motion.p>

        <motion.div
          {...rise(0.24)}
          className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        >
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              Retour à l&apos;accueil
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/contact">
              <LifeBuoy className="size-4" />
              Nous contacter
            </Link>
          </Button>
        </motion.div>

        <motion.nav
          {...rise(0.3)}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
        >
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </motion.nav>
      </div>
    </main>
  );
}
