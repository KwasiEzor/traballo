"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowItem {
  key: string;
  node: React.ReactNode;
}

export interface CoverflowCarouselProps {
  items: CoverflowItem[];
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width — smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  /** Any CSS length for the card width — the rake scales off it. */
  cardWidth?: string;
  /** Any CSS length for the card height. Defaults to `cardWidth` (square). */
  cardHeight?: string;
  /** Space between cards, as a fraction of card width. */
  gap?: number;
  loop?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  /** Auto-advance interval in ms. 0 disables. Pauses on hover / focus / drag. */
  autoPlayMs?: number;
  /** Names the carousel for assistive tech. */
  label?: string;
  className?: string;
  cardClassName?: string;
}

export function CoverflowCarousel({
  items,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = "clamp(240px, 34vw, 340px)",
  cardHeight,
  gap = 0.08,
  loop = true,
  showPagination = true,
  showNavigation = true,
  autoPlayMs = 0,
  label = "Carrousel",
  className,
  cardClassName,
}: CoverflowCarouselProps) {
  const count = items.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count]
  );

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      // Fade only kicks in over the last half-step before a card teleports
      // across the ring, so small rings (3–4 cards) keep full-strength
      // neighbours instead of washing them out.
      const edge = loop
        ? Math.min(1, Math.max(0, count / 2 - distance) * 2)
        : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
      card.setAttribute("aria-hidden", distance < 0.5 ? "false" : "true");
      card.style.pointerEvents = distance < 0.5 ? "auto" : "none";
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      if (reduced) {
        posRef.current = target;
        paint();
        return;
      }

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint, reduced]
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop]
  );

  const goTo = React.useCallback(
    (index: number) => {
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle]
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle]
  );

  React.useEffect(() => {
    if (!autoPlayMs || reduced || paused || count < 2) return;
    const t = setInterval(() => nudge(1), autoPlayMs);
    return () => clearInterval(t);
  }, [autoPlayMs, reduced, paused, count, nudge]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return (
    <div
      className={cn("w-full", className)}
      style={
        {
          "--cf-card": cardWidth,
          "--cf-card-h": cardHeight ?? cardWidth,
        } as React.CSSProperties
      }
      role="region"
      aria-roledescription="carrousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden py-10 outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: "var(--cf-card-h)",
              transformStyle: "preserve-3d",
            }}
          >
            {items.map((item, index) => (
              <div
                key={item.key}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="diapositive"
                aria-label={`${index + 1} sur ${count}`}
                className={cn(
                  "absolute left-1/2 top-0 h-full overflow-hidden rounded-3xl will-change-transform",
                  cardClassName
                )}
                style={{ width: "var(--cf-card)" }}
              >
                {item.node}
              </div>
            ))}
          </div>
        </div>

        {showNavigation && count > 1 && (
          <>
            <button
              type="button"
              aria-label="Précédent"
              onClick={() => nudge(-1)}
              className="absolute left-2 top-1/2 z-[200] grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background sm:left-4"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Suivant"
              onClick={() => nudge(1)}
              className="absolute right-2 top-1/2 z-[200] grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background sm:right-4"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {showPagination && count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.key}
              type="button"
              aria-label={`Aller à la diapositive ${index + 1}`}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              className="h-1.5 rounded-full bg-foreground transition-all"
              style={{ width: index === selected ? 22 : 6, opacity: index === selected ? 1 : 0.25 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
