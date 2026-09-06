import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "amber" | "purple" | "cyan" | "red";

const TONE: Record<Tone, string> = {
  blue: "bg-primary/10 text-primary",
  green: "bg-success-subtle text-success",
  amber: "bg-warning-subtle text-warning-foreground",
  purple: "bg-chart-4/15 text-chart-4",
  cyan: "bg-chart-5/15 text-chart-5",
  red: "bg-destructive/10 text-destructive",
};

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "blue",
  delta,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
  delta?: { value: number; good?: boolean };
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", TONE[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs">
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium",
              delta.good === false ? "text-destructive" : "text-success"
            )}
          >
            {delta.value >= 0 ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {delta.value >= 0 ? "+" : ""}
            {delta.value} %
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
