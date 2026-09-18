"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateInvoiceReminderOverride } from "./actions/update-reminder-override";

export function InvoiceReminderToggle({
  invoiceId,
  enabled,
}: {
  invoiceId: string;
  enabled: boolean;
}) {
  const router = useRouter();
  const [checked, setChecked] = React.useState(enabled);
  const [pending, setPending] = React.useState(false);

  async function onChange(next: boolean) {
    setChecked(next);
    setPending(true);
    const res = await updateInvoiceReminderOverride(invoiceId, next);
    setPending(false);
    if (res.error) {
      toast.error(res.error);
      setChecked(!next);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor="reminder-toggle" className="text-muted-foreground">
        Relances automatiques
      </Label>
      <Switch
        id="reminder-toggle"
        checked={checked}
        disabled={pending}
        onCheckedChange={onChange}
      />
    </div>
  );
}
