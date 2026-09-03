"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import type { Client } from "@/db/schema";
import {
  createClientAction,
  updateClientAction,
  type ClientFormState,
} from "./actions";

const initial: ClientFormState = {};

export function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const action = client
    ? updateClientAction.bind(null, client.id)
    : createClientAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <Alert variant="destructive">
          <AlertContent>
            <AlertDescription>{state.error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">
          Nom <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={client?.name ?? ""}
          placeholder="Mme Bernard / SCI Lumière"
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
            placeholder="client@exemple.fr"
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={client?.phone ?? ""}
            placeholder="06 12 34 56 78"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Adresse</Label>
        <Textarea
          id="address"
          name="address"
          rows={2}
          defaultValue={client?.address ?? ""}
          placeholder="14 rue des Tilleuls, 69003 Lyon"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes internes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={client?.notes ?? ""}
          placeholder="Digicode, préférences, historique…"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {client ? "Enregistrer" : "Créer le client"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
