"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * After creating an appointment with "Envoyer une confirmation", tells the
 * artisan what happened to the client e-mail, then cleans the URL.
 */
export function AppointmentNoticeToast({ status }: { status?: string }) {
  const router = useRouter();

  React.useEffect(() => {
    if (status === "sent") {
      toast.success("Rendez-vous confirmé — client prévenu par e-mail.");
    } else if (status === "skipped") {
      toast("Rendez-vous confirmé. Le client n'a pas d'e-mail : aucune confirmation envoyée.");
    } else if (status === "failed") {
      toast.error("Rendez-vous créé, mais la confirmation n'a pas pu partir.");
    }
    if (status) router.replace("/dashboard/appointments");
  }, [status, router]);

  return null;
}
