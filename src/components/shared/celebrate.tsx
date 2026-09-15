import { toast } from "sonner";
import { Mascot } from "@/components/shared/mascot";

/** Toast de succès avec la mascotte — pour une action marquante (facture payée, RDV confirmé…). */
export function celebrate(message: string) {
  toast.custom(() => (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      <Mascot pose="success" size={40} />
      <p className="text-sm font-medium text-foreground">{message}</p>
    </div>
  ));
}
