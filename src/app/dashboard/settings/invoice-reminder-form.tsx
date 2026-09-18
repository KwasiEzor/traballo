"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DEFAULT_REMINDER_TEMPLATE } from "@/lib/invoices/reminders";
import { saveInvoiceReminderSettings } from "./actions/save-invoice-reminder-settings";

export function InvoiceReminderForm({
  enabled: initialEnabled,
  template: initialTemplate,
}: {
  enabled: boolean;
  template: string | null;
}) {
  const [enabled, setEnabled] = React.useState(initialEnabled);
  const [template, setTemplate] = React.useState(initialTemplate ?? "");
  const [pending, setPending] = React.useState(false);

  async function onSave() {
    setPending(true);
    const res = await saveInvoiceReminderSettings({
      invoiceReminderEnabled: enabled,
      invoiceReminderTemplate: template,
    });
    setPending(false);
    if (res.error) return toast.error(res.error);
    toast.success("Réglages de relance enregistrés.");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-foreground">
            Relances automatiques
          </div>
          <div className="text-xs text-muted-foreground">
            Un rappel est envoyé à vos clients 7 puis 30 jours après
            l&apos;échéance d&apos;une facture impayée.
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reminder-template">Modèle de relance</Label>
        <Textarea
          id="reminder-template"
          rows={6}
          placeholder={DEFAULT_REMINDER_TEMPLATE}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Placeholders disponibles : {"{{client}} {{number}} {{amount}} {{days}} {{link}}"}.
          Laissez vide pour utiliser le modèle par défaut.
        </p>
      </div>

      <Button onClick={onSave} disabled={pending} size="sm">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Enregistrer
      </Button>
    </div>
  );
}
