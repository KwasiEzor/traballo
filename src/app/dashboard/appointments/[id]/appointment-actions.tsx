"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAppointmentStatus } from "../actions/update-status";

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
    if (res && "error" in res && res.error) return toast.error(res.error);
    toast.success("Statut mis à jour.");
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
        <Button variant="outline" onClick={() => set("cancelled")} disabled={busy}>
          <X className="size-4" /> Annuler
        </Button>
      )}
    </div>
  );
}
