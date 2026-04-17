"use client";

/**
 * Artisan profile form
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "../actions/save-profile";
import type { ArtisanProfile } from "@/db/schema";

interface ProfileFormProps {
  profile?: ArtisanProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      businessName: formData.get("businessName") as string,
      ownerName: formData.get("ownerName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      whatsappNumber: formData.get("whatsappNumber") as string,
      address: formData.get("address") as string,
      vatNumber: formData.get("vatNumber") as string,
      iban: formData.get("iban") as string,
      tradeType: formData.get("tradeType") as string,
    };

    try {
      const result = await saveProfile(data);

      if (result?.error) {
        setError(result.error);
      } else {
        alert("Profil enregistré avec succès!");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Nom de l'entreprise *
        </label>
        <input
          type="text"
          name="businessName"
          defaultValue={profile?.businessName}
          required
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Nom du gérant *
        </label>
        <input
          type="text"
          name="ownerName"
          defaultValue={profile?.ownerName}
          required
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Email *</label>
        <input
          type="email"
          name="email"
          defaultValue={profile?.email}
          required
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Téléphone</label>
          <input
            type="tel"
            name="phone"
            defaultValue={profile?.phone || ""}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">WhatsApp</label>
          <input
            type="tel"
            name="whatsappNumber"
            defaultValue={profile?.whatsappNumber || ""}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Adresse</label>
        <textarea
          name="address"
          defaultValue={profile?.address || ""}
          rows={3}
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">N° TVA</label>
          <input
            type="text"
            name="vatNumber"
            defaultValue={profile?.vatNumber || ""}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">IBAN</label>
          <input
            type="text"
            name="iban"
            defaultValue={profile?.iban || ""}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Type de métier</label>
        <input
          type="text"
          name="tradeType"
          defaultValue={profile?.tradeType || ""}
          placeholder="Ex: Plombier, Électricien, Menuisier..."
          className="w-full rounded-lg border px-4 py-2"
        />
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
