import { cn } from "@/lib/utils";

/**
 * Traballo monogram — a solid "T" on a 100×100 grid with a chiselled foot,
 * evoking a tool's edge. See src/app/traballo-logo-masters/logo-mark.md for
 * the full construction spec. Fill is currentColor so it inherits the
 * badge's foreground (white on the primary-coloured square below).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <path d="M 8,8 L 92,8 L 92,42 L 73,42 L 73,30 L 61,30 L 61,60 L 39,72 L 39,30 L 27,30 L 27,42 L 8,42 Z" />
      <path d="M 61,71 L 39,83 L 39,92 L 61,92 Z" />
    </svg>
  );
}

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
        <LogoMark className="size-[18px]" />
      </span>
      {showWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Traballo
        </span>
      )}
    </span>
  );
}
