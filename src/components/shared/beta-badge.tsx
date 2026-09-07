import { cn } from "@/lib/utils";
import { isBeta } from "@/lib/site-phase";

/**
 * Small "Bêta" pill. Renders nothing outside the beta phase, so it can be
 * dropped next to a logo or title unconditionally.
 */
export function BetaBadge({ className }: { className?: string }) {
  if (!isBeta()) return null;

  return (
    <span
      className={cn(
        "inline-flex select-none items-center rounded-full border border-primary/30 bg-primary-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-primary",
        className
      )}
      title="Traballo est en phase de test — des évolutions et des correctifs sont en cours."
    >
      Bêta
    </span>
  );
}
