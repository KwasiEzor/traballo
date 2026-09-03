import { cn } from "@/lib/utils";

/**
 * Traballo wordmark. The mark is a stylised "T" formed from a plumb line /
 * set square — a nod to the trades, reading as an institutional monogram.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
          <path
            d="M4 5.5h16M12 5.5V17m0 0-3.2 2.5M12 17l3.2 2.5"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="20.2" r="1.4" fill="currentColor" />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Traballo
        </span>
      )}
    </span>
  );
}
