/**
 * Signature hero backdrop: a slow-drifting mesh under a fine blueprint
 * grid, finished with a film-grain layer. Pure CSS — no canvas, no client
 * JS, cheap to render and safe for prefers-reduced-motion (the `drift`
 * keyframes are muted globally for that preference in globals.css).
 *
 * The mesh is deliberately split: brand-blue pools toward the copy side,
 * copper toward the mascot/product side — the two brand colours read as
 * one composition instead of a token copper dab in a corner.
 */
export function GrainGradient({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="absolute -top-1/3 left-1/2 h-[140%] w-[140%] -translate-x-1/2 opacity-[0.6]"
        style={{
          background:
            "radial-gradient(36% 30% at 22% 22%, color-mix(in oklch, var(--primary) 32%, transparent), transparent 70%)," +
            "radial-gradient(42% 38% at 78% 30%, color-mix(in oklch, var(--copper) 30%, transparent), transparent 70%)," +
            "radial-gradient(34% 30% at 60% 62%, color-mix(in oklch, var(--copper) 16%, transparent), transparent 70%)," +
            "radial-gradient(38% 34% at 30% 65%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 70%)",
          animation: "drift 22s ease-in-out infinite",
        }}
      />
      <div className="absolute inset-0 bg-blueprint [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,black,transparent)]" />
      <div className="absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  );
}
