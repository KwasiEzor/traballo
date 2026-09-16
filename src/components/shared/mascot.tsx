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
  assistant: {
    src: "/mascot/removed/trabby-2D-rmv.png",
    alt: "Le castor Traballo, votre assistant",
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
      {/* Respiration au repos — en attendant une vraie mascotte animée
          (Lottie, en pause pour le moment, voir MOTION_PRINCIPLES.md) */}
      <motion.div
        className="relative size-full"
        animate={reduced ? undefined : { y: -4 }}
        transition={
          reduced
            ? undefined
            : {
                duration: 1.8,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }
        }
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-contain"
        />
      </motion.div>
    </motion.div>
  );
}
