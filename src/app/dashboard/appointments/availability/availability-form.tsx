"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { saveAvailability } from "./actions/save-availability";
import type { Availability } from "@/db/schema";

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export function AvailabilityForm({
  existingSlots,
}: {
  existingSlots: Availability[];
}) {
  const [loading, setLoading] = React.useState(false);
  const [slots, setSlots] = React.useState(
    DAYS.map((_, i) => {
      const existing = existingSlots.find((s) => s.dayOfWeek === i);
      return {
        dayOfWeek: i,
        enabled: Boolean(existing),
        startTime: existing?.startTime?.slice(0, 5) ?? "09:00",
        endTime: existing?.endTime?.slice(0, 5) ?? "17:00",
      };
    })
  );

  const update = (i: number, patch: Partial<(typeof slots)[number]>) =>
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  async function onSave() {
    setLoading(true);
    const payload = slots
      .filter((s) => s.enabled)
      .map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }));
    const res = await saveAvailability(payload);
    setLoading(false);
    if (res && "error" in res && res.error) return toast.error(res.error);
    toast.success("Disponibilités enregistrées.");
  }

  return (
    <div className="space-y-3">
      {slots.map((s, i) => (
        <div
          key={i}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
        >
          <div className="flex w-32 items-center gap-3">
            <Switch
              checked={s.enabled}
              onCheckedChange={(v) => update(i, { enabled: v })}
              id={`day-${i}`}
            />
            <Label htmlFor={`day-${i}`} className="cursor-pointer">
              {DAYS[i]}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={s.startTime}
              disabled={!s.enabled}
              onChange={(e) => update(i, { startTime: e.target.value })}
              className="w-32"
            />
            <span className="text-muted-foreground">→</span>
            <Input
              type="time"
              value={s.endTime}
              disabled={!s.enabled}
              onChange={(e) => update(i, { endTime: e.target.value })}
              className="w-32"
            />
          </div>
        </div>
      ))}

      <Button onClick={onSave} disabled={loading} className="mt-2">
        {loading && <Loader2 className="size-4 animate-spin" />}
        Enregistrer les disponibilités
      </Button>
    </div>
  );
}
