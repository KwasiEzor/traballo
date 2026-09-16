"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

function Digit({ digit }: { digit: number }) {
  const reduced = useReducedMotion();
  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden align-baseline">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        animate={{ y: `-${digit}em` }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 26 }
        }
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="flex h-[1em] items-center justify-center leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** Price-style number that rolls digit by digit, like a mechanical counter. */
export function OdometerNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const chars = React.useMemo(() => String(value).split(""), [value]);
  return (
    <span className={cn("inline-flex tabular-nums", className)}>
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <Digit key={i} digit={Number(c)} />
        ) : (
          <span key={i}>{c}</span>
        )
      )}
    </span>
  );
}
