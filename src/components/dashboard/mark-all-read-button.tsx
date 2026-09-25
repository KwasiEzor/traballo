"use client";

import * as React from "react";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markAllNotificationsReadAction } from "@/app/dashboard/notifications/actions";

export function MarkAllReadButton({
  size = "sm",
  variant = "outline",
  className,
}: {
  size?: "sm" | "md";
  variant?: "outline" | "ghost";
  className?: string;
}) {
  const [pending, startTransition] = React.useTransition();

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await markAllNotificationsReadAction();
          if (!res.ok) toast.error(res.error.message);
        })
      }
    >
      <CheckCheck className="size-4" /> Tout marquer comme lu
    </Button>
  );
}
