import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth/better-auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;

  async function requestReset(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    try {
      await auth.api.requestPasswordReset({
        body: { email, redirectTo: "/auth/reset-password" },
        headers: await headers(),
      });
    } catch {
      // Do not reveal whether the address exists.
    }
    redirect("/auth/forgot-password?sent=1");
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="On vous envoie un lien pour en choisir un nouveau."
    >
      {params.sent ? (
        <Alert variant="success">
          <CheckCircle2 />
          <AlertContent>
            <AlertDescription>
              Si un compte existe pour cette adresse, un lien de
              réinitialisation vient d&apos;être envoyé.
            </AlertDescription>
          </AlertContent>
        </Alert>
      ) : (
        <form action={requestReset} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="vous@exemple.fr"
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            Envoyer le lien
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link
          href="/auth/signin"
          className="font-medium text-primary hover:underline"
        >
          Retour à la connexion
        </Link>
      </p>
    </AuthShell>
  );
}
