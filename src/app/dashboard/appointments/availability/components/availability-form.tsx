"use client";

/**
 * Availability configuration form
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAvailability } from "../actions/save-availability";
import type { Availability } from "@/db/schema";

interface AvailabilityFormProps {
  existingSlots: Availability[];
}

const DAYS = [
  { value: 0, label: "Lundi" },
  { value: 1, label: "Mardi" },
  { value: 2, label: "Mercredi" },
  { value: 3, label: "Jeudi" },
  { value: 4, label: "Vendredi" },
  { value: 5, label: "Samedi" },
  { value: 6, label: "Dimanche" },
];

export function AvailabilityForm({ existingSlots }: AvailabilityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize slots with existing or default values
  const [slots, setSlots] = useState(
    DAYS.map((day) => {
      const existing = existingSlots.find((s) => s.dayOfWeek === day.value);
      return {
        dayOfWeek: day.value,
        enabled: !!existing,
        startTime: existing?.startTime || "09:00",
        endTime: existing?.endTime || "17:00",
      };
    })
  );

  const handleToggleDay = (dayOfWeek: number) => {
    setSlots(
      slots.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSlots(
      slots.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const enabledSlots = slots.filter((s) => s.enabled);

      if (enabledSlots.length === 0) {
        setError("Sélectionnez au moins un jour");
        setLoading(false);
        return;
      }

      const result = await saveAvailability(enabledSlots);

      if (result?.error) {
        setError(result.error);
      } else {
        alert("Disponibilités enregistrées!");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save availability"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
      )}

      <div className="space-y-3">
        {DAYS.map((day) => {
          const slot = slots.find((s) => s.dayOfWeek === day.value)!;
          return (
            <div key={day.value} className="flex items-center gap-4">
              <label className="flex w-32 items-center gap-2">
                <input
                  type="checkbox"
                  checked={slot.enabled}
                  onChange={() => handleToggleDay(day.value)}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">{day.label}</span>
              </label>

              {slot.enabled && (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) =>
                      handleTimeChange(day.value, "startTime", e.target.value)
                    }
                    className="rounded-lg border px-3 py-2"
                  />
                  <span className="text-gray-600">à</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) =>
                      handleTimeChange(day.value, "endTime", e.target.value)
                    }
                    className="rounded-lg border px-3 py-2"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
