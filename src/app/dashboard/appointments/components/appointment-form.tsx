"use client";

/**
 * Appointment form component
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAppointment } from "../actions/create-appointment";
import type { Client } from "@/db/schema";

interface AppointmentFormProps {
  clients: Client[];
}

export function AppointmentForm({ clients }: AppointmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      clientId: formData.get("clientId") as string,
      title: formData.get("title") as string,
      startDate: formData.get("startDate") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const result = await createAppointment(data);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // Success - redirect handled by server action
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create appointment"
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">Titre *</label>
        <input
          type="text"
          name="title"
          required
          placeholder="Ex: Installation robinetterie"
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Client</label>
        <select
          name="clientId"
          className="w-full rounded-lg border px-4 py-2"
        >
          <option value="">Aucun client (optionnel)</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Date *</label>
        <input
          type="date"
          name="startDate"
          required
          min={new Date().toISOString().split("T")[0]}
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Heure de début *
          </label>
          <input
            type="time"
            name="startTime"
            required
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            Heure de fin *
          </label>
          <input
            type="time"
            name="endTime"
            required
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Notes</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Détails supplémentaires..."
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer le rendez-vous"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border px-6 py-2 hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
