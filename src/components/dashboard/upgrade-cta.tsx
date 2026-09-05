import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Plan = "free" | "pro" | "business" | string;

/** The plan a Free/Pro account should be nudged toward. */
function nextPlan(plan: Plan): "pro" | "business" | null {
  if (plan === "free") return "pro";
  if (plan === "pro") return "business";
  return null;
}

const LABEL = { pro: "Pro", business: "Business" } as const;
const HREF = "/dashboard/settings?tab=abonnement";

/** Compact inline button — safe to drop anywhere; renders nothing on Business. */
export function UpgradeButton({
  plan,
  size = "sm",
  variant = "default",
  className,
}: {
  plan: Plan;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "outline";
  className?: string;
}) {
  const target = nextPlan(plan);
  if (!target) return null;
  return (
    <Button
      asChild
      size={size}
      variant={variant === "default" ? "primary" : variant}
      className={className}
    >
      <Link href={HREF}>
        <Sparkles className="size-4" />
        Passer à {LABEL[target]}
      </Link>
    </Button>
  );
}

/** Page-level card — headline + reason + CTA. Renders nothing on Business. */
export function UpgradeCard({
  plan,
  reason,
  className,
}: {
  plan: Plan;
  /** Why this user would want to upgrade, shown as the body copy. */
  reason?: string;
  className?: string;
}) {
  const target = nextPlan(plan);
  if (!target) return null;

  const defaultReason =
    target === "pro"
      ? "Factures illimitées et conformes Factur-X, rendez-vous en ligne, domaine personnalisé, site sans marque Traballo."
      : "Agent IA sur votre site, WhatsApp Business, rappels SMS, analytics visiteurs et inbox unifiée.";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary-subtle p-5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Passez au plan {LABEL[target]}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {reason ?? defaultReason}
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href={HREF}>
          Voir le plan {LABEL[target]}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
