"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { deleteClientAction } from "../actions";

export function ClientDangerZone({ clientId }: { clientId: string }) {
  const [error, setError] = React.useState<string | null>(null);

  async function onDelete() {
    const res = await deleteClientAction(clientId);
    if (res && "error" in res && res.error) setError(res.error);
  }

  return (
    <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-5">
      <h3 className="text-sm font-semibold text-foreground">Supprimer ce client</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Le client est retiré du carnet. Ses factures existantes sont conservées.
      </p>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" className="mt-3">
            <Trash2 className="size-4" /> Supprimer
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce client ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive. Vous pourrez toujours consulter les
              factures déjà émises.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Annuler</Button>
            </DialogClose>
            <form action={onDelete}>
              <Button type="submit" variant="destructive">
                Supprimer définitivement
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
