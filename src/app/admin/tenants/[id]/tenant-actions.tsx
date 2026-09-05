"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { UserCog, Ban, RotateCcw, Mail, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  adminChangePlan,
  adminSetStatus,
  adminResendVerification,
  adminUpdateProfile,
  adminStartImpersonation,
  type TenantActionState,
} from "./actions";

const initial: TenantActionState = {};

export function TenantActions({
  tenantId,
  slug,
  plan,
  status,
  ownerEmail,
  ownerName,
  phone,
  hasProfile,
}: {
  tenantId: string;
  slug: string;
  plan: string;
  status: string;
  ownerEmail: string | null;
  ownerName: string;
  phone: string;
  hasProfile: boolean;
}) {
  const [planState, planAction, planPending] = useActionState(
    adminChangePlan,
    initial
  );
  const [statusState, statusAction, statusPending] = useActionState(
    adminSetStatus,
    initial
  );
  const [verifState, verifAction, verifPending] = useActionState(
    adminResendVerification,
    initial
  );
  const [profState, profAction, profPending] = useActionState(
    adminUpdateProfile,
    initial
  );

  const [nextPlan, setNextPlan] = React.useState(plan);

  React.useEffect(() => {
    for (const s of [planState, statusState, verifState, profState]) {
      if (s.ok) toast.success("Action effectuée.");
      if (s.error) toast.error(s.error);
    }
  }, [planState, statusState, verifState, profState]);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="size-4 text-primary" />
          Actions administrateur
        </CardTitle>
        <CardDescription>
          Chaque action est enregistrée dans l&apos;historique.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Plan */}
        <form action={planAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="plan" value={nextPlan} />
          <div className="space-y-1.5">
            <Label className="text-xs">Plan</Label>
            <Select value={nextPlan} onValueChange={setNextPlan}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={planPending || nextPlan === plan}
          >
            Appliquer le plan
          </Button>
        </form>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {/* Impersonate */}
          <form action={adminStartImpersonation}>
            <input type="hidden" name="tenantId" value={tenantId} />
            <Button type="submit" size="sm" variant="outline">
              <LogIn className="size-4" />
              Se connecter comme cet artisan
            </Button>
          </form>

          {/* Suspend / reactivate */}
          <form action={statusAction}>
            <input type="hidden" name="tenantId" value={tenantId} />
            <input
              type="hidden"
              name="status"
              value={status === "suspended" ? "active" : "suspended"}
            />
            <Button
              type="submit"
              size="sm"
              variant={status === "suspended" ? "outline" : "destructive"}
              disabled={statusPending}
            >
              {status === "suspended" ? (
                <>
                  <RotateCcw className="size-4" /> Réactiver
                </>
              ) : (
                <>
                  <Ban className="size-4" /> Suspendre
                </>
              )}
            </Button>
          </form>

          {/* Resend verification */}
          {ownerEmail && (
            <form action={verifAction}>
              <input type="hidden" name="tenantId" value={tenantId} />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={verifPending}
              >
                <Mail className="size-4" /> Renvoyer la vérification e-mail
              </Button>
            </form>
          )}
        </div>

        {/* Edit profile basics */}
        {hasProfile && (
          <form
            action={profAction}
            className="grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <input type="hidden" name="tenantId" value={tenantId} />
            <div className="space-y-1.5">
              <Label className="text-xs">Nom du gérant</Label>
              <Input name="ownerName" defaultValue={ownerName} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Téléphone</Label>
              <Input name="phone" defaultValue={phone} />
            </div>
            <Button type="submit" size="sm" variant="outline" disabled={profPending}>
              Enregistrer
            </Button>
          </form>
        )}

        <p className="text-xs text-muted-foreground">
          Sous-domaine : <span className="font-mono">{slug}.traballo.pro</span>
        </p>
      </CardContent>
    </Card>
  );
}
