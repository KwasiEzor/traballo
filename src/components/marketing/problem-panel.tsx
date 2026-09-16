import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Eyebrow } from "@/components/marketing/section";
import { DimensionMark } from "@/components/marketing/dimension-mark";
import { Mascot } from "@/components/shared/mascot";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { TiltCard } from "@/components/motion/tilt-card";
import type { LucideIcon } from "lucide-react";

const OLD_WAYS = [
  "Carnet de rendez-vous en papier",
  "Factures bricolées sur Excel",
  "Devis oubliés dans WhatsApp",
  "Site vitrine jamais mis à jour",
];

export interface ProblemStat {
  icon: LucideIcon;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

/**
 * "Le constat" — an editorial two-up instead of a flat stat grid: a pinned
 * logbook of the old, manual habits (crossed out, mascot commiserating) next
 * to a blueprint-style measurement rail for the numbers. Ties the section
 * back to the workshop/technical-drawing motif (DimensionMark, bg-blueprint)
 * used throughout the marketing site instead of a generic card row.
 */
export function ProblemPanel({
  eyebrow,
  title,
  lede,
  stats,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  stats: ProblemStat[];
}) {
  return (
    <div className="grid gap-16 lg:grid-cols-[0.95fr_1.15fr] lg:items-center lg:gap-12">
      <div className="min-w-0">
        <Reveal className="max-w-xl">
          <DimensionMark label="Le quotidien, sans Traballo" className="mb-5" />
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            {lede}
          </p>
        </Reveal>

        {/* The pinned logbook — a physical artifact for the pain, not just
            prose. Crossed-out habits + the mascot pulling a face gives the
            abstract "89% n'ont pas d'outils adaptés" claim a face and a
            texture instead of just another number. */}
        <Reveal delay={0.1} className="mt-10 max-w-sm">
          <div className="relative rotate-[-1.5deg] rounded-2xl border border-copper/30 bg-copper p-6 text-copper-foreground shadow-glow-copper transition-transform duration-300 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.2)] hover:rotate-0">
            <div
              aria-hidden="true"
              className="absolute -top-3 left-9 h-6 w-16 -rotate-6 rounded-sm bg-copper-foreground/20 shadow-sm"
            />
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-copper-foreground/80">
              Le carnet du lundi matin
            </p>
            <ul className="mt-4 space-y-2.5">
              {OLD_WAYS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[15px] leading-snug text-copper-foreground/90"
                >
                  <X className="mt-0.5 size-3.5 shrink-0 text-copper-foreground/70" />
                  <span className="line-through decoration-copper-foreground/60 decoration-2">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <Mascot
              pose="error"
              size={68}
              className="absolute -right-5 -bottom-6 rotate-6 drop-shadow-lg"
            />
          </div>
        </Reveal>
      </div>

      {/* The measurement rail — stats read like annotations on a blueprint,
          strung along a dimension line instead of sitting in a plain grid. */}
      <RevealGroup className="relative space-y-5 sm:pl-2">
        <div
          aria-hidden="true"
          className="absolute top-3 bottom-3 left-[27px] hidden w-px bg-border sm:block"
        />
        {stats.map((stat) => (
          <RevealItem key={stat.label} className="relative flex items-center gap-5">
            <TiltCard className="hidden shrink-0 sm:block">
              <div className="relative z-10 grid size-14 place-items-center rounded-full border border-border bg-card shadow-sm">
                <stat.icon className="size-5 text-primary" />
              </div>
            </TiltCard>
            <div className="hover-lift flex min-w-0 flex-1 items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm sm:gap-6">
              <stat.icon className="size-5 shrink-0 text-primary sm:hidden" />
              <div className="min-w-0">
                <div className="font-display text-3xl font-semibold bg-gradient-to-r from-primary to-copper bg-clip-text text-transparent sm:text-4xl">
                  {stat.prefix}
                  <CountUp value={stat.value} />
                  {stat.suffix}
                </div>
                <p className="mt-1 text-sm text-muted-foreground text-balance">
                  {stat.label}
                </p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
