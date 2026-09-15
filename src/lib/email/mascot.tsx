/**
 * Mascot visuals for transactional emails — a separate, email-safe sibling
 * of src/components/shared/mascot.tsx. Email clients render static HTML
 * only (no next/image, no motion/react), and images must be absolute URLs
 * since the recipient's mail client fetches them directly, not through the
 * app's own server.
 */
import * as React from "react";
import { Img } from "@react-email/components";
import { EMAIL_BRAND as B } from "./brand";

const EMAIL_MASCOT_POSES = {
  welcome: {
    file: "trabby-3D-onboarding-rmv.png",
    alt: "Le castor Traballo vous accueille",
  },
  error: {
    file: "trabby-3D-error-rmv.png",
    alt: "Le castor Traballo, perplexe",
  },
} as const;

export type EmailMascotPose = keyof typeof EMAIL_MASCOT_POSES;

export function EmailMascot({
  pose,
  size = 72,
}: {
  pose: EmailMascotPose;
  size?: number;
}) {
  const { file, alt } = EMAIL_MASCOT_POSES[pose];
  return (
    <Img
      src={`${B.site}/mascot/removed/${file}`}
      width={size}
      height={size}
      alt={alt}
      style={{ display: "block", margin: "0 auto 16px" }}
    />
  );
}
