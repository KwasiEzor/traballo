"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewItem } from "@/lib/artisan/site-config";

const AUTOPLAY_MS = 6500;
const NAME_ROW = 56;
const NAME_SPAN = 2; // names shown each side of the active one

function average(items: ReviewItem[]) {
  const rated = items.filter((r) => typeof r.rating === "number");
  if (rated.length === 0) return null;
  const sum = rated.reduce((n, r) => n + (r.rating ?? 0), 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

/** Signed distance from `i` to `active`, wrapped to the shortest way round. */
function ring(i: number, active: number, len: number) {
  let d = i - active;
  if (d > len / 2) d -= len;
  if (d < -len / 2) d += len;
  return d;
}

function Stars({ n, color }: { n: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, s) => (
        <Star
          key={s}
          className="size-4"
          style={{ color }}
          fill={s < n ? "currentColor" : "none"}
          strokeWidth={s < n ? 0 : 1.5}
        />
      ))}
    </div>
  );
}

/* --------------------------- single testimonial -------------------------- */

function SoloReview({
  review,
  color,
}: {
  review: ReviewItem;
  color: string;
}) {
  return (
    <figure className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
      <Quote
        className="size-7"
        style={{ color }}
        fill="currentColor"
        strokeWidth={0}
      />
      {typeof review.rating === "number" && (
        <div className="mt-3">
          <Stars n={review.rating} color={color} />
        </div>
      )}
      <blockquote className="mt-4 text-lg leading-relaxed text-slate-700 sm:text-xl">
        {review.text}
      </blockquote>
      <figcaption className="mt-6 text-sm font-semibold text-slate-900">
        {review.name}
      </figcaption>
    </figure>
  );
}

/* ------------------------------- carousel -------------------------------- */

export function ReviewsCarousel({
  items,
  primaryColor,
}: {
  items: ReviewItem[];
  primaryColor: string;
  businessName?: string;
}) {
  const reduced = useReducedMotion();
  const len = items.length;

  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [canPeek, setCanPeek] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setCanPeek(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = React.useCallback(
    (dir: 1 | -1) => setActive((a) => mod(a + dir, len)),
    [len]
  );
  const jump = React.useCallback((i: number) => setActive(mod(i, len)), [len]);

  React.useEffect(() => {
    if (reduced || paused || len < 2) return;
    const t = setInterval(() => setActive((a) => mod(a + 1, len)), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [reduced, paused, len]);

  if (len === 1) return <SoloReview review={items[0]} color={primaryColor} />;

  const avg = average(items);
  const spring = reduced
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 240, damping: 26, mass: 0.9 } as const);

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:min-h-[440px] lg:flex-row"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="group"
      aria-roledescription="carrousel"
      aria-label="Témoignages de clients"
    >
      {/* left — brand panel with the scrolling name list */}
      <div
        className="relative shrink-0 overflow-hidden px-6 py-6 lg:w-[38%] lg:p-10"
        style={{ backgroundColor: primaryColor }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
          Ils nous ont fait confiance
        </p>

        <div className="mt-3 flex items-baseline gap-2 text-white">
          {avg !== null && (
            <span className="font-display text-3xl font-bold tabular-nums lg:text-4xl">
              {avg.toLocaleString("fr-FR")}
            </span>
          )}
          <span className="text-sm text-white/80">
            {avg !== null && "/ 5 · "}
            {len} avis
          </span>
        </div>

        {/* mobile: just the active name */}
        <div className="mt-3 lg:hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-lg font-semibold text-white"
            >
              {items[active].name}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* desktop: spring-scrolling wheel of names */}
        <div className="relative mt-6 hidden h-[calc(100%-7rem)] lg:block">
          <div className="absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[var(--pc)] to-transparent" style={{ ["--pc" as string]: primaryColor }} />
          <div className="absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[var(--pc)] to-transparent" style={{ ["--pc" as string]: primaryColor }} />
          <div className="relative flex h-full items-center">
            {items.map((r, i) => {
              const d = ring(i, active, len);
              const hidden = Math.abs(d) > NAME_SPAN;
              const isActive = d === 0;
              return (
                <motion.button
                  key={`${r.name}-${i}`}
                  type="button"
                  onClick={() => jump(i)}
                  animate={{
                    y: d * NAME_ROW,
                    opacity: hidden ? 0 : isActive ? 1 : Math.max(0.3, 1 - Math.abs(d) * 0.32),
                    pointerEvents: hidden ? "none" : "auto",
                  }}
                  transition={spring}
                  className={cn(
                    "absolute left-0 flex items-center gap-2.5 rounded-full border px-4 py-2 text-left text-sm font-medium tracking-tight transition-colors",
                    isActive
                      ? "border-white bg-white"
                      : "border-white/25 bg-transparent text-white/70 hover:border-white/50 hover:text-white"
                  )}
                  style={isActive ? { color: primaryColor } : undefined}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{
                      backgroundColor: isActive ? primaryColor : "rgba(255,255,255,.5)",
                    }}
                  />
                  <span className="whitespace-nowrap">{r.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* right — the quote card stack */}
      <div className="relative flex flex-1 items-center justify-center bg-slate-50/60 p-6 sm:p-10 lg:p-12">
        <div className="relative h-[288px] w-full max-w-xl sm:h-[300px]">
          {items.map((r, i) => {
            const d = ring(i, active, len);
            const isActive = d === 0;
            const isPeek = canPeek && Math.abs(d) === 1;
            return (
              <motion.figure
                key={`${r.name}-${i}`}
                initial={false}
                animate={{
                  x: isActive ? 0 : d < 0 ? -72 : 72,
                  scale: isActive ? 1 : isPeek ? 0.9 : 0.82,
                  rotate: reduced ? 0 : isActive ? 0 : d < 0 ? -3 : 3,
                  opacity: isActive ? 1 : isPeek ? 0.5 : 0,
                  zIndex: isActive ? 20 : isPeek ? 10 : 0,
                }}
                transition={spring}
                style={{ pointerEvents: isActive ? "auto" : "none" }}
                className="absolute inset-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] sm:p-8"
              >
                {/* content lives on its own opacity track so peek/outgoing
                    cards never show text mid-transition */}
                <motion.div
                  className="flex h-full flex-col justify-center"
                  initial={{ opacity: isActive ? 1 : 0 }}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: reduced ? 0 : isActive ? 0.3 : 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <Quote
                      className="size-7"
                      style={{ color: primaryColor }}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                    {typeof r.rating === "number" && (
                      <Stars n={r.rating} color={primaryColor} />
                    )}
                  </div>
                  <blockquote className="mt-4 overflow-hidden text-[15px] leading-relaxed text-slate-700 [-webkit-box-orient:vertical] [-webkit-line-clamp:6] [display:-webkit-box] sm:text-base">
                    {r.text}
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <span
                      className="grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: primaryColor }}
                      aria-hidden
                    >
                      {r.name.trim().charAt(0).toUpperCase()}
                    </span>
                    {r.name}
                  </figcaption>
                </motion.div>

                {/* faint glyph so the bare peek card doesn't read as empty */}
                {!isActive && (
                  <Quote
                    className="absolute right-6 top-6 size-8 opacity-[0.07]"
                    style={{ color: primaryColor }}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                )}
              </motion.figure>
            );
          })}
        </div>

        {/* controls */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Témoignage précédent"
          className="absolute left-2 top-1/2 z-30 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:text-slate-900 sm:left-3"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Témoignage suivant"
          className="absolute right-2 top-1/2 z-30 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:text-slate-900 sm:right-3"
        >
          <ChevronRight className="size-4" />
        </button>

        <div className="absolute inset-x-0 bottom-4 z-30 flex items-center justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => jump(i)}
              aria-label={`Aller au témoignage ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === active ? 20 : 6,
                backgroundColor:
                  i === active ? primaryColor : "rgb(203 213 225)",
              }}
            />
          ))}
        </div>

        {/* autoplay progress */}
        {!reduced && len > 1 && (
          <div className="absolute inset-x-0 bottom-0 z-30 h-0.5 bg-slate-200/70">
            <motion.div
              key={`${active}-${paused}`}
              className="h-full"
              style={{ backgroundColor: primaryColor }}
              initial={{ width: "0%" }}
              animate={{ width: paused ? "0%" : "100%" }}
              transition={{
                duration: paused ? 0 : AUTOPLAY_MS / 1000,
                ease: "linear",
              }}
            />
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        Témoignage {active + 1} sur {len}. {items[active].name}&nbsp;:{" "}
        {items[active].text}
      </p>
    </div>
  );
}
