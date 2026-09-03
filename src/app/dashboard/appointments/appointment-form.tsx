"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { createAppointment } from "./actions/create-appointment";
import type { Client } from "@/db/schema";

const isoDate = (d: Date) => d.toISOString().split("T")[0];

export function AppointmentForm({
  clients,
  defaultClientId,
}: {
  clients: Pick<Client, "id" | "name">[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [clientId, setClientId] = React.useState(defaultClientId ?? "none");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await createAppointment({
      clientId: clientId === "none" ? "" : clientId,
      title: String(fd.get("title") ?? ""),
      startDate: String(fd.get("startDate") ?? ""),
      startTime: String(fd.get("startTime") ?? ""),
      endTime: String(fd.get("endTime") ?? ""),
      notes: String(fd.get("notes") ?? ""),
    });
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertContent>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Objet du rendez-vous</Label>
        <Input id="title" name="title" required placeholder="Devis salle de bain" />
      </div>

      <div className="space-y-1.5">
        <Label>Client</Label>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sans client</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={isoDate(new Date())}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startTime">Début</Label>
          <Input id="startTime" name="startTime" type="time" required defaultValue="09:00" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endTime">Fin</Label>
          <Input id="endTime" name="endTime" type="time" required defaultValue="10:00" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} placeholder="Adresse, précisions…" />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Planifier le rendez-vous
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
