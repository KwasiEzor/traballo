"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Traces an element's outline like a technical pen drafting a blueprint,
 * once it scrolls into view. This is the element's only border — draw it
 * instead of layering a CSS border underneath, or the two edges can
 * mismatch by a fraction of a pixel at the corners. Under reduced motion
 * it renders the finished outline immediately, with no draw-on.
 */
export function DraftBorder({
  className,
  radius = 16,
  delay = 0,
  duration = 1.1,
  strokeWidth = 1.5,
}: {
  className?: string;
  radius?: number;
  delay?: number;
  duration?: number;
  strokeWidth?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 size-full overflow-visible",
        className
      )}
    >
      <motion.rect
        x="0.75"
        y="0.75"
        width="calc(100% - 1.5px)"
        height="calc(100% - 1.5px)"
        rx={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        initial={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
        transition={reduced ? { duration: 0 } : { duration, ease: EASE, delay }}
      />
    </svg>
  );
}
