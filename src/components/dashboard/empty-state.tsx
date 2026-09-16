import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Mascot, type MascotPose } from "@/components/shared/mascot";

export function EmptyState({
  icon: Icon,
  mascotPose,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  mascotPose?: MascotPose;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center",
        className
      )}
    >
      {mascotPose ? (
        <Mascot pose={mascotPose} size={96} />
      ) : Icon ? (
        <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-6" />
        </div>
      ) : null}
      <h3 className="mt-4 font-display text-base font-semibold text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
