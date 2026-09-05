import { ShieldAlert } from "lucide-react";
import { stopImpersonationAction } from "@/app/dashboard/actions";

/** Shown across the dashboard whenever a super-admin is acting as this tenant. */
export function ImpersonationBanner({ by }: { by: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-warning px-4 py-2 text-center text-xs font-medium text-warning-foreground">
      <span className="flex items-center gap-1.5">
        <ShieldAlert className="size-3.5" />
        Mode support — vous consultez ce compte en tant que {by}
      </span>
      <form action={stopImpersonationAction}>
        <button
          type="submit"
          className="rounded bg-warning-foreground/15 px-2 py-0.5 font-semibold underline-offset-2 hover:underline"
        >
          Quitter
        </button>
      </form>
    </div>
  );
}
