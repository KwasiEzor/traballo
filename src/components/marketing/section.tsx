import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({
  className,
  containerClassName,
  children,
  id,
  ...props
}: React.ComponentProps<"section"> & { containerClassName?: string }) {
  return (
    <section id={id} className={cn("py-20 sm:py-28", className)} {...props}>
      <div className={cn("container-page", containerClassName)}>{children}</div>
    </section>
  );
}

export function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.14em] text-primary",
        className
      )}
      {...props}
    />
  );
}

export function SectionIntro({
  eyebrow,
  title,
  lede,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl text-center items-center" : "max-w-2xl",
        className
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {lede && (
        <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
          {lede}
        </p>
      )}
    </div>
  );
}
