"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/** Shows a toast after returning from Stripe Checkout, then cleans the URL. */
export function CheckoutToast({ status }: { status?: string }) {
  const router = useRouter();

  React.useEffect(() => {
    if (status === "success") {
      toast.success("Paiement confirmé — votre plan est actif dans un instant.");
    } else if (status === "cancel") {
      toast("Paiement annulé. Aucun changement n'a été effectué.");
    }
    if (status) {
      router.replace("/dashboard/settings?tab=abonnement");
    }
  }, [status, router]);

  return null;
}
