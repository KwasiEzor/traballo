"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { remindersIncluded } from "@/lib/invoices/reminders";
import type { PlanGate } from "@/lib/notifications/types";
import { saveInvoiceRemindersAction } from "./actions/save-invoice-reminders";

export function InvoiceRemindersToggle({
  enabled,
  plan,
}: {
  enabled: boolean;
  plan: PlanGate;
}) {
  const included = remindersIncluded(plan);
  const [on, setOn] = React.useState(enabled);
  const [pending, startTransition] = React.useTransition();

  function change(next: boolean) {
    setOn(next);
    startTransition(async () => {
      const res = await saveInvoiceRemindersAction(next);
      if (!res.ok) {
        setOn(!next);
        toast.error(res.error.message);
        return;
      }
      toast.success(next ? "Relances activées." : "Relances désactivées.");
    });
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          Relances automatiques
        </p>
        <p className="text-sm text-muted-foreground">
          Vos clients reçoivent un rappel 7 jours puis 30 jours après
          l&apos;échéance d&apos;une facture impayée, à vos couleurs, facture
          en pièce jointe. Vous êtes prévenu à chaque envoi.
        </p>
        {!included && (
          <p className="text-sm text-muted-foreground">
            Disponible avec le{" "}
            <Link
              href="/dashboard/settings?tab=abonnement"
              className="text-primary hover:underline"
            >
              plan Pro
            </Link>
            .
          </p>
        )}
      </div>
      <Switch
        aria-label="Relances automatiques des factures"
        checked={included && on}
        disabled={!included || pending}
        onCheckedChange={change}
      />
    </div>
  );
}
