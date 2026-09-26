"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { setInvoiceRemindersPausedAction } from "./actions/pause-reminders";

/**
 * Per-invoice switch for the automatic reminders (J+7 / J+30). Shown on an
 * unpaid invoice of a Pro+ account; when the reminders are off for the whole
 * account, points to Settings instead.
 */
export function InvoiceReminderPause({
  invoiceId,
  paused,
  enabledInSettings,
}: {
  invoiceId: string;
  paused: boolean;
  enabledInSettings: boolean;
}) {
  const [active, setActive] = React.useState(!paused);
  const [pending, startTransition] = React.useTransition();

  if (!enabledInSettings) {
    return (
      <p className="text-sm text-muted-foreground">
        Les relances automatiques sont désactivées pour tout votre compte (
        <Link
          href="/dashboard/settings?tab=notifications"
          className="text-primary hover:underline"
        >
          Paramètres
        </Link>
        ).
      </p>
    );
  }

  function change(next: boolean) {
    setActive(next);
    startTransition(async () => {
      const res = await setInvoiceRemindersPausedAction(invoiceId, !next);
      if (!res.ok) {
        setActive(!next);
        toast.error(res.error.message);
        return;
      }
      toast.success(next ? "Relances reprises." : "Relances suspendues pour cette facture.");
    });
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Rappel au client 7 jours puis 30 jours après l&apos;échéance.
        Suspendez-les si un échéancier est convenu.
      </p>
      <Switch
        aria-label="Relances automatiques pour cette facture"
        checked={active}
        disabled={pending}
        onCheckedChange={change}
      />
    </div>
  );
}
