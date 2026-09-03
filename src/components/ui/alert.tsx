import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3.5 text-sm flex items-start gap-3 [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        info: "bg-primary-subtle text-accent-foreground border-primary/20 [&>svg]:text-primary",
        success: "bg-success-subtle text-success border-success/25",
        warning: "bg-warning-subtle text-warning-foreground border-warning/30",
        destructive: "bg-destructive/8 text-destructive border-destructive/25",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  );
}

function AlertContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 space-y-0.5", className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("font-medium leading-snug tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed opacity-90", className)}
      {...props}
    />
  );
}

export { Alert, AlertContent, AlertTitle, AlertDescription };
