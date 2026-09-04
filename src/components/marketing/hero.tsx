"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck, MapPin, FileCheck2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductFrame } from "@/components/marketing/product-frame";
import { GrainGradient } from "@/components/marketing/grain-gradient";
import { DashboardMock, ChatMock } from "@/components/marketing/mockups";
import { APP_URL } from "@/lib/marketing/nav";

const trust = [
  { icon: MapPin, label: "Données hébergées en Europe" },
  { icon: FileCheck2, label: "Factur-X & PEPPOL" },
  { icon: ShieldCheck, label: "Sans engagement" },
];

const EASE = [0.16, 1, 0.3, 1] as const;
const HEADLINE = ["Tout votre", "business d'artisan."];

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border">
      <GrainGradient />

      <div className="container-page relative pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 10 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Badge variant="outline" className="mx-auto bg-card/80 backdrop-blur-sm">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Facturation électronique obligatoire dès 2026
            </Badge>
          </motion.div>

          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl">
            {HEADLINE.map((line, i) => (
              <motion.span
                key={line}
                className="block"
                initial={reduced ? undefined : { opacity: 0, y: 24 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.09, ease: EASE }}
              >
                {line}
              </motion.span>
            ))}
            <motion.span
              className="block text-primary"
              initial={reduced ? undefined : { opacity: 0, y: 24 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
            >
              Un seul tableau de bord.
            </motion.span>
          </h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground"
            initial={reduced ? undefined : { opacity: 0, y: 14 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          >
            Site web professionnel, factures conformes Factur-X, agent IA qui
            répond à vos clients 24&nbsp;h/24 et rendez-vous automatisés. Prêt en
            30&nbsp;minutes, à partir de&nbsp;0&nbsp;€.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
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
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
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

        <motion.div
          className="relative mx-auto mt-16 max-w-4xl sm:mt-24"
          initial={reduced ? undefined : { opacity: 0, y: 40, rotateX: 8 }}
          animate={reduced ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
          style={{ transformPerspective: 1400 }}
        >
          <ProductFrame designWidth={680} className="shadow-glow">
            <DashboardMock />
          </ProductFrame>

          <motion.div
            className="absolute -bottom-8 -left-6 hidden w-52 rounded-lg border border-border bg-card shadow-lg sm:block"
            initial={reduced ? undefined : { opacity: 0, y: 20, x: -10 }}
            animate={reduced ? undefined : { opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.7, delay: 1, ease: EASE }}
          >
            <ChatMock compact />
          </motion.div>

          <motion.div
            className="absolute -bottom-6 -right-4 hidden w-56 rounded-lg border border-border bg-card p-3 shadow-lg md:block"
            initial={reduced ? undefined : { opacity: 0, y: 20, x: 10 }}
            animate={reduced ? undefined : { opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-success">
              <FileCheck2 className="size-4" />
              Facture transmise à PEPPOL
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              2026-0042 · accusé de réception reçu
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-3 -top-5 hidden items-center gap-1.5 rounded-full border border-copper/30 bg-copper-subtle px-3 py-1.5 text-xs font-medium text-copper shadow-sm lg:flex"
            initial={reduced ? undefined : { opacity: 0, scale: 0.9 }}
            animate={reduced ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.15, ease: EASE }}
          >
            <Sparkles className="size-3.5" />
            Agent IA en ligne
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
