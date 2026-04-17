"use client";

/**
 * Client form component
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../actions/create-client";

export function ClientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const result = await createClient(data);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // Success - redirect handled by server action
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">Nom *</label>
        <input
          type="text"
          name="name"
          required
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Téléphone</label>
        <input
          type="tel"
          name="phone"
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Adresse</label>
        <textarea
          name="address"
          rows={3}
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Notes</label>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer le client"}
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
