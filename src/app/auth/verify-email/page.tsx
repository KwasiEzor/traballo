import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Vérifiez votre email" };

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Vérifiez votre email">
      <div className="rounded-xl border border-border bg-muted/40 p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-subtle text-primary">
          <MailCheck className="size-6" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Nous venons de vous envoyer un lien de confirmation. Cliquez dessus pour
          activer votre compte, puis connectez-vous.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Pensez à vérifier vos courriers indésirables si vous ne le voyez pas
          dans quelques minutes.
        </p>
      </div>

      <Button asChild size="lg" className="mt-6 w-full">
        <Link href="/auth/signin">Aller à la connexion</Link>
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Besoin d&apos;aide ?{" "}
        <Link href="/contact" className="font-medium text-primary hover:underline">
          Contactez-nous
        </Link>
      </p>
    </AuthShell>
  );
}
