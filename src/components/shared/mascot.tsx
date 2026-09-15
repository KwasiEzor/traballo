"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const MASCOT_POSES = {
  welcome: {
    src: "/mascot/removed/trabby-3D-onboarding-rmv.png",
    alt: "Le castor Traballo vous accueille",
  },
  success: {
    src: "/mascot/removed/trabby-3D-success-rmv.png",
    alt: "Le castor Traballo lève le poing, victorieux",
  },
  empty: {
    src: "/mascot/removed/trabby-3D-empty-rmv.png",
    alt: "Le castor Traballo assis, en attente",
  },
  error: {
    src: "/mascot/removed/trabby-3D-error-rmv.png",
    alt: "Le castor Traballo, perplexe",
  },
} as const;

export type MascotPose = keyof typeof MASCOT_POSES;

const EASE = [0.16, 1, 0.3, 1] as const; // expo-out — cohérent avec src/components/motion/reveal.tsx

/** La mascotte Traballo, déclinée par état émotionnel (voir MASCOT_POSES). */
export function Mascot({
  pose,
  size = 96,
  className,
}: {
  pose: MascotPose;
  size?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { src, alt } = MASCOT_POSES[pose];

  return (
    <motion.div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      initial={reduced ? undefined : { opacity: 0, scale: 0.9, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-contain"
      />
    </motion.div>
  );
}
