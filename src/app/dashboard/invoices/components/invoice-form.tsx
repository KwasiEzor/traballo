"use client";

/**
 * Invoice form component
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "../actions/create-invoice";
import type { Client } from "@/db/schema";
import type { InvoiceItemInput } from "@/lib/validations/invoice";

interface InvoiceFormProps {
  clients: Client[];
}

export function InvoiceForm({ clients }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  );
  const [items, setItems] = useState<InvoiceItemInput[]>([
    { description: "", quantity: 1, unitPrice: 0, taxRate: 21 },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      { description: "", quantity: 1, unitPrice: 0, taxRate: 21 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItemInput,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createInvoice({
        clientId,
        issueDate,
        dueDate,
        items,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // Success - redirect handled by server action
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
      )}

      {/* Client selection */}
      <div>
        <label className="mb-2 block text-sm font-medium">Client *</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded-lg border px-4 py-2"
          required
        >
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Date d'émission *
          </label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            Date d'échéance *
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
            required
          />
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Articles *</label>
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-blue-600 hover:underline"
          >
            + Ajouter une ligne
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                className="flex-1 rounded-lg border px-4 py-2"
                required
              />
              <input
                type="number"
                placeholder="Qté"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", parseFloat(e.target.value))
                }
                className="w-20 rounded-lg border px-4 py-2"
                min="0"
                step="0.01"
                required
              />
              <input
                type="number"
                placeholder="Prix HT"
                value={item.unitPrice}
                onChange={(e) =>
                  updateItem(index, "unitPrice", parseFloat(e.target.value))
                }
                className="w-32 rounded-lg border px-4 py-2"
                min="0"
                step="0.01"
                required
              />
              <input
                type="number"
                placeholder="TVA %"
                value={item.taxRate}
                onChange={(e) =>
                  updateItem(index, "taxRate", parseFloat(e.target.value))
                }
                className="w-24 rounded-lg border px-4 py-2"
                min="0"
                max="100"
                step="0.01"
                required
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer la facture"}
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
