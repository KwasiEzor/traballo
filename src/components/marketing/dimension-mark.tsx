import { cn } from "@/lib/utils";

/**
 * A technical-drawing dimension line (tick—line—tick), the recurring
 * "workshop / blueprint" motif that ties the brand to the trades without
 * being literal. Decorative only.
 */
export function DimensionMark({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-copper", className)} aria-hidden="true">
      <svg width="40" height="10" viewBox="0 0 40 10" fill="none" className="shrink-0">
        <path d="M1 1v8M39 1v8M1 5h38" stroke="currentColor" strokeWidth="1" />
      </svg>
      {label && (
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-copper">
          {label}
        </span>
      )}
    </span>
  );
}
