"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, CheckCheck } from "lucide-react";
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
import { celebrate } from "@/components/shared/celebrate";
import { updateAppointmentStatus } from "../actions/update-status";

const TOLD = " — client prévenu par e-mail.";

export function AppointmentActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function set(next: "confirmed" | "cancelled" | "completed") {
    setBusy(true);
    const res = await updateAppointmentStatus(id, next);
    setBusy(false);
    if ("error" in res) return toast.error(res.error);

    const told = res.client === "sent";
    if (next === "confirmed") celebrate(`Rendez-vous confirmé${told ? TOLD : "."}`);
    else if (next === "completed") celebrate("Rendez-vous marqué comme terminé.");
    else toast.success(`Rendez-vous annulé${told ? TOLD : "."}`);
    if (res.client === "failed") {
      toast.error("Statut mis à jour, mais l'e-mail au client n'a pas pu partir.");
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "pending" && (
        <Button onClick={() => set("confirmed")} disabled={busy}>
          <Check className="size-4" /> Confirmer
        </Button>
      )}
      {(status === "pending" || status === "confirmed") && (
        <Button variant="success" onClick={() => set("completed")} disabled={busy}>
          <CheckCheck className="size-4" /> Terminé
        </Button>
      )}
      {status !== "cancelled" && status !== "completed" && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={busy}>
              <X className="size-4" /> Annuler
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Annuler ce rendez-vous ?</DialogTitle>
              <DialogDescription>
                S&apos;il a une adresse e-mail, le client est prévenu, avec vos
                excuses et une invitation à convenir d&apos;un autre créneau.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Garder</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive" onClick={() => set("cancelled")}>
                  Annuler le rendez-vous
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
