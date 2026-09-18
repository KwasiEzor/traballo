"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { CATEGORY_LABELS, type NotificationCategory } from "@/lib/notifications/types";
import type { NotificationPrefsMap } from "@/lib/notifications/prefs";
import { subscribeToPush } from "@/lib/notifications/push-client";
import { toggleNotificationPrefAction } from "./actions/save-notification-prefs";
import { savePushSubscription } from "./actions/push-subscription";

const CATEGORIES: NotificationCategory[] = [
  "leads",
  "appointments",
  "invoices",
  "billing",
];

const CHANNELS = [
  { key: "email", label: "E-mail" },
  { key: "in_app", label: "Dans l'app" },
  { key: "push", label: "Push" },
] as const;

export function NotificationPrefsForm({
  prefs,
  vapidPublicKey,
}: {
  prefs: NotificationPrefsMap;
  /** Absent when push isn't configured server-side — the push column then always fails cleanly. */
  vapidPublicKey?: string;
}) {
  const [state, setState] = React.useState(prefs);
  const [pending, setPending] = React.useState<string | null>(null);

  async function toggle(
    category: NotificationCategory,
    channel: (typeof CHANNELS)[number]["key"],
    enabled: boolean
  ) {
    const key = `${category}:${channel}`;
    setPending(key);

    if (channel === "push" && enabled) {
      try {
        const subscription = await subscribeToPush(vapidPublicKey ?? "");
        const saved = await savePushSubscription(subscription);
        if (saved.error) throw new Error(saved.error);
      } catch (err) {
        setPending(null);
        toast.error(err instanceof Error ? err.message : "Échec de l'activation du push.");
        return;
      }
    }

    setState((prev) => ({
      ...prev,
      [category]: { ...prev[category], [channel]: enabled },
    }));
    const res = await toggleNotificationPrefAction({ category, channel, enabled });
    setPending(null);
    if (res.error) {
      toast.error(res.error);
      setState((prev) => ({
        ...prev,
        [category]: { ...prev[category], [channel]: !enabled },
      }));
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Catégorie</th>
            {CHANNELS.map((c) => (
              <th key={c.key} className="px-3 py-2 text-center font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((category) => (
            <tr key={category} className="border-b border-border last:border-0">
              <td className="py-3 pr-4 font-medium text-foreground">
                {CATEGORY_LABELS[category]}
              </td>
              {CHANNELS.map((c) => (
                <td key={c.key} className="px-3 py-3 text-center">
                  <Switch
                    checked={state[category][c.key]}
                    disabled={pending === `${category}:${c.key}`}
                    onCheckedChange={(checked) => toggle(category, c.key, checked)}
                    aria-label={`${CATEGORY_LABELS[category]} — ${c.label}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
