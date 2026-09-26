"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  CONFIGURABLE_CATEGORIES,
  CONFIGURABLE_CHANNELS,
  categoryChannels,
  type ConfigurableCategory,
  type ConfigurableChannel,
  type PlanGate,
} from "@/lib/notifications/types";
import type { NotificationPrefs } from "@/lib/notifications/prefs";
import { saveNotificationPrefsAction } from "./actions/save-notification-prefs";

const CATEGORY_COPY: Record<
  ConfigurableCategory,
  { label: string; description: string; lockedNote?: string }
> = {
  leads: {
    label: "Demandes de contact",
    description: "Formulaire de votre site et assistant IA.",
    lockedNote:
      "E-mail toujours envoyé : une demande manquée, c'est un client perdu.",
  },
  invoices: {
    label: "Factures",
    description: "Factures payées, en retard, relances envoyées.",
  },
  appointments: {
    label: "Rendez-vous",
    description: "Nouveaux rendez-vous, rappels, annulations.",
  },
};

const CHANNEL_LABELS: Record<ConfigurableChannel, string> = {
  in_app: "Dans l'app",
  email: "E-mail",
};

export function NotificationPrefsForm({
  prefs: initial,
  plan,
}: {
  prefs: NotificationPrefs;
  plan: PlanGate;
}) {
  const [prefs, setPrefs] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);

  function toggle(
    category: ConfigurableCategory,
    channel: ConfigurableChannel,
    on: boolean
  ) {
    setPrefs((p) => ({ ...p, [category]: { ...p[category], [channel]: on } }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await saveNotificationPrefsAction(prefs);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    setPrefs(res.value);
    toast.success("Préférences enregistrées.");
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="divide-y divide-border rounded-lg border border-border">
        <div className="hidden grid-cols-[1fr_6rem_6rem] gap-3 px-4 py-2 text-xs font-medium text-muted-foreground sm:grid">
          <span>Catégorie</span>
          {CONFIGURABLE_CHANNELS.map((channel) => (
            <span key={channel} className="text-center">
              {CHANNEL_LABELS[channel]}
            </span>
          ))}
        </div>

        {CONFIGURABLE_CATEGORIES.map((category) => {
          const copy = CATEGORY_COPY[category];
          const options = categoryChannels(category, plan);
          const hasLock = options.some((o) => o.locked);
          return (
            <div
              key={category}
              className="grid gap-3 p-4 sm:grid-cols-[1fr_6rem_6rem] sm:items-center"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {copy.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {copy.description}
                </p>
                {hasLock && copy.lockedNote && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3 shrink-0" aria-hidden />
                    {copy.lockedNote}
                  </p>
                )}
              </div>

              {CONFIGURABLE_CHANNELS.map((channel) => {
                const option = options.find((o) => o.channel === channel);
                if (!option) {
                  return (
                    <span
                      key={channel}
                      className="hidden text-center text-sm text-muted-foreground sm:block"
                      aria-hidden
                    >
                      —
                    </span>
                  );
                }
                return (
                  <div
                    key={channel}
                    className="flex items-center justify-between gap-3 sm:justify-center"
                  >
                    <span className="text-sm text-muted-foreground sm:hidden">
                      {CHANNEL_LABELS[channel]}
                    </span>
                    <Switch
                      aria-label={`${copy.label} — ${CHANNEL_LABELS[channel]}`}
                      checked={option.locked || prefs[category][channel]}
                      disabled={option.locked || loading}
                      onCheckedChange={(on) => toggle(category, channel, on)}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Les notifications d&apos;abonnement et de paiement sont transactionnelles :
        elles partent quoi qu&apos;il arrive, dans l&apos;app et par e-mail.
      </p>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
