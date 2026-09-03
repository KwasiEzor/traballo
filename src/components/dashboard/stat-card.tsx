import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  trend?: { direction: "up" | "down"; label: string; good?: boolean };
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs">
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium",
              trend.good === false ? "text-destructive" : "text-success"
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {trend.label}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
