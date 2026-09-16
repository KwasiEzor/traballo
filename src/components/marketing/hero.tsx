"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform, useScroll } from "motion/react";
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

// The headline's variable trade word — starts on "artisan" (matching the
// static first paint) then cycles through the métiers Traballo actually
// serves, typed and deleted like a real typewriter.
const HERO_TRADES = [
  "d'artisan",
  "de plombier",
  "d'électricien",
  "de menuisier",
  "de peintre",
  "de carreleur",
  "de couvreur",
  "de jardinier",
];

const TRADE_TYPING_MS = 65;
const TRADE_DELETING_MS = 35;
const TRADE_PAUSE_TYPED_MS = 1900;
const TRADE_PAUSE_EMPTY_MS = 350;

function TypingTrade() {
  const reduced = useReducedMotion();
  const [display, setDisplay] = React.useState(HERO_TRADES[0]);

  React.useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      if (!cancelled) timers.push(setTimeout(fn, ms));
    };
    let wordIndex = 0;

    function typeWord() {
      const word = HERO_TRADES[wordIndex]!;
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i += 1;
        setDisplay(word.slice(0, i));
        if (i < word.length) {
          schedule(tick, TRADE_TYPING_MS);
        } else {
          schedule(deleteWord, TRADE_PAUSE_TYPED_MS);
        }
      };
      schedule(tick, TRADE_TYPING_MS);
    }

    function deleteWord() {
      const word = HERO_TRADES[wordIndex]!;
      let i = word.length;
      const tick = () => {
        if (cancelled) return;
        i -= 1;
        setDisplay(word.slice(0, i));
        if (i > 0) {
          schedule(tick, TRADE_DELETING_MS);
        } else {
          wordIndex = (wordIndex + 1) % HERO_TRADES.length;
          schedule(typeWord, TRADE_PAUSE_EMPTY_MS);
        }
      };
      schedule(tick, TRADE_DELETING_MS);
    }

    schedule(deleteWord, TRADE_PAUSE_TYPED_MS);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced]);

  const isComplete = HERO_TRADES.includes(display);

  return (
    <span aria-hidden="true">
      {display}
      {isComplete ? "." : ""}
      {!reduced && <span className="animate-pulse">▍</span>}
    </span>
  );
}

/** A copper highlighter stroke drawn under a key phrase — the headline's
 * one deliberate nod to the mascot's warm palette, not just brand-blue.
 * A hand-drawn SVG blob (not a plain rectangle) so it reads as a marker
 * stroke, not a stray colour artifact. */
function Highlight({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <span className="relative inline-block">
      <span className="relative z-10 [text-shadow:0_1px_2px_color-mix(in_oklch,var(--background)_92%,transparent),0_2px_14px_color-mix(in_oklch,var(--background)_75%,transparent)]">
        {children}
      </span>
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
            className="fill-copper/55"
          />
        </svg>
      </motion.div>
    </span>
  );
}

export function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);

  // Hover tilt on the collage — a subtle 3D lean toward the cursor, as if
  // the pinned mockup/mascot/chat card were physical objects on a board.
  // Desktop/mouse only (skipped on touch and prefers-reduced-motion).
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], [-6, 6]), springConfig);

  function handleCollagePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    tiltX.set((e.clientX - rect.left) / rect.width - 0.5);
    tiltY.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleCollagePointerLeave() {
    tiltX.set(0);
    tiltY.set(0);
  }

  // Scroll parallax — the three collage layers drift at different rates as
  // the hero scrolls past, closest (mascot) moving most, giving a sense of
  // depth instead of the whole collage panning as one flat image.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const parallaxSpring = { stiffness: 100, damping: 30 };
  const yMascot = useSpring(useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -55]), parallaxSpring);
  const yFrame = useSpring(useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -10]), parallaxSpring);
  const yChat = useSpring(useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -40]), parallaxSpring);

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-b border-border">
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

            <h1
              className="mt-6 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl"
              aria-label="Tout votre business d'artisan. Un seul tableau de bord."
            >
              <motion.span
                className="block"
                initial={reduced ? undefined : { opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              >
                Tout votre
              </motion.span>
              <motion.span
                className="block"
                initial={reduced ? undefined : { opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.17, ease: EASE }}
              >
                business
              </motion.span>
              {/* Always its own line, independent of "business" above — the
                  trade word's length changes as it types/deletes, and pinning
                  it to a fixed line (rather than letting it share a line and
                  wrap unpredictably) keeps the rest of the headline from
                  jumping as the word grows and shrinks. */}
              <motion.span
                className="block"
                initial={reduced ? undefined : { opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.24, ease: EASE }}
              >
                <Highlight>
                  <TypingTrade />
                </Highlight>
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-primary to-copper bg-clip-text text-transparent"
                initial={reduced ? undefined : { opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.31, ease: EASE }}
              >
                Un seul tableau
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-primary to-copper bg-clip-text text-transparent"
                initial={reduced ? undefined : { opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.38, ease: EASE }}
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
              <Button asChild variant="cta" size="lg" className="w-full sm:w-auto">
                <a href={`${APP_URL}/auth/signup`}>
                  Commencer gratuitement
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
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
            {/* Tilt wrapper — leans toward the cursor like a pinned object
                reacting to a hand nearby. Separate element from the entrance
                motion.div above so the two transforms (fade-in vs hover tilt)
                don't fight over the same style. */}
            <motion.div
              className="relative"
              style={{ rotateX, rotateY, transformPerspective: 1000 }}
              onPointerMove={handleCollagePointerMove}
              onPointerLeave={handleCollagePointerLeave}
            >
              <motion.div style={{ y: yMascot }}>
                <motion.div
                  className="absolute -top-20 -left-1 z-20 sm:-top-24 sm:left-2 lg:-top-28"
                  initial={reduced ? undefined : { opacity: 0, scale: 0.85, rotate: -6, y: -8 }}
                  animate={reduced ? undefined : { opacity: 1, scale: 1, rotate: -4, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
                >
                  <div className="rotate-[-4deg]">
                    <Mascot pose="welcome" size={112} />
                  </div>
                </motion.div>
              </motion.div>

              <motion.div style={{ y: yFrame }}>
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
                    <span className="relative flex size-1.5">
                      {!reduced && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-copper/60" />
                      )}
                      <span className="relative inline-flex size-1.5 rounded-full bg-copper" />
                    </span>
                    Agent IA en ligne
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div style={{ y: yChat }}>
                <motion.div
                  className="absolute -bottom-6 -left-4 z-20 w-48 -rotate-3 rounded-lg border border-border bg-card shadow-lg sm:-left-8 sm:w-52"
                  initial={reduced ? undefined : { opacity: 0, y: 20, x: -10, rotate: -8 }}
                  animate={reduced ? undefined : { opacity: 1, y: 0, x: 0, rotate: -3 }}
                  transition={{ duration: 0.7, delay: 1.05, ease: EASE }}
                >
                  <HeroChatDemo />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
