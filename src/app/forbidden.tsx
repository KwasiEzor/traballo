import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { Mascot } from "@/components/shared/mascot";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <Logo />
      <div className="max-w-md">
        <Mascot pose="error" size={112} className="mx-auto" />
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
          Accès refusé
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vous n&apos;avez pas les autorisations nécessaires pour accéder à cette
          page. Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur,
          contactez un administrateur.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard">Tableau de bord</Link>
          </Button>
          <Button asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
