import Link from "next/link";
import { Check } from "lucide-react";
import type { SetupStep } from "@/lib/dashboard/chrome";
import { cn } from "@/lib/utils";

/**
 * Onboarding nudge shown in the sidebar until every step is done. Plain
 * component so it works in the server aside and the client mobile drawer.
 */
export function SetupChecklist({
  steps,
  doneCount,
  total,
  onNavigate,
}: {
  steps: SetupStep[];
  doneCount: number;
  total: number;
  onNavigate?: () => void;
}) {
  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-sidebar-foreground">
          Finalisez votre configuration
        </p>
        <span className="text-[11px] font-medium text-sidebar-foreground/55">
          {doneCount}/{total}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sidebar-border">
        <div
          className="h-full rounded-full bg-sidebar-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-3 space-y-1">
        {steps.map((s) => (
          <li key={s.key}>
            <Link
              href={s.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-1.5 py-1 text-xs transition-colors",
                s.done
                  ? "text-sidebar-foreground/45"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
              )}
            >
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded-full border",
                  s.done
                    ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground"
                    : "border-sidebar-foreground/30"
                )}
              >
                {s.done && <Check className="size-3" strokeWidth={3} />}
              </span>
              <span className={cn(s.done && "line-through")}>{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
