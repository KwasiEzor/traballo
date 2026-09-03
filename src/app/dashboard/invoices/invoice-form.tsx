"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { formatEUR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { createInvoice } from "./actions/create-invoice";
import type { Client } from "@/db/schema";
import type { InvoiceItemInput } from "@/lib/validations/invoice";

const isoDate = (d: Date) => d.toISOString().split("T")[0];

export function InvoiceForm({
  clients,
  defaultClientId,
}: {
  clients: Pick<Client, "id" | "name">[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [clientId, setClientId] = React.useState(defaultClientId ?? "");
  const [issueDate, setIssueDate] = React.useState(isoDate(new Date()));
  const [dueDate, setDueDate] = React.useState(
    isoDate(new Date(Date.now() + 30 * 864e5))
  );
  const [items, setItems] = React.useState<InvoiceItemInput[]>([
    { description: "", quantity: 1, unitPrice: 0, taxRate: 21 },
  ]);

  const setItem = (i: number, field: keyof InvoiceItemInput, value: string | number) =>
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it))
    );

  const totals = items.reduce(
    (acc, it) => {
      const sub = Number(it.quantity) * Number(it.unitPrice);
      const tax = (sub * Number(it.taxRate)) / 100;
      acc.subtotal += sub;
      acc.tax += tax;
      return acc;
    },
    { subtotal: 0, tax: 0 }
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!clientId) return setError("Sélectionnez un client.");
    setLoading(true);
    const result = await createInvoice({ clientId, issueDate, dueDate, items });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // success → server action redirects
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertContent>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <Card>
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-3">
            <Label>Client</Label>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun client.{" "}
                <Link
                  href="/dashboard/clients/new"
                  className="font-medium text-primary hover:underline"
                >
                  Ajoutez-en un
                </Link>{" "}
                d&apos;abord.
              </p>
            ) : (
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issueDate">Date d&apos;émission</Label>
            <Input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Date d&apos;échéance</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_5rem_7rem_5rem_auto] sm:items-end sm:border-0 sm:p-0"
              >
                <div className="space-y-1">
                  {i === 0 && <Label className="text-xs">Description</Label>}
                  <Input
                    value={item.description}
                    onChange={(e) => setItem(i, "description", e.target.value)}
                    placeholder="Prestation ou fourniture"
                    required
                  />
                </div>
                <div className="space-y-1">
                  {i === 0 && <Label className="text-xs">Qté</Label>}
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => setItem(i, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  {i === 0 && <Label className="text-xs">Prix unit. HT</Label>}
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => setItem(i, "unitPrice", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  {i === 0 && <Label className="text-xs">TVA %</Label>}
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    value={item.taxRate}
                    onChange={(e) => setItem(i, "taxRate", Number(e.target.value))}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Supprimer la ligne"
                  disabled={items.length === 1}
                  onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() =>
              setItems((p) => [
                ...p,
                { description: "", quantity: 1, unitPrice: 0, taxRate: 21 },
              ])
            }
          >
            <Plus className="size-4" /> Ajouter une ligne
          </Button>

          <div className="mt-6 ml-auto w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Total HT</span>
              <span className="tabular-nums">{formatEUR(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>TVA</span>
              <span className="tabular-nums">{formatEUR(totals.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 font-display text-base font-semibold text-foreground">
              <span>Total TTC</span>
              <span className="tabular-nums">
                {formatEUR(totals.subtotal + totals.tax)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading || clients.length === 0}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Créer la facture
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
