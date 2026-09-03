/**
 * Sign up page — Better Auth email/password.
 * Tenant + membership provisioning happens in a Better Auth create-user hook
 * (src/lib/tenant/provision.ts), so it also covers Google sign-in.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth/better-auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Créez votre compte Traballo gratuitement. Site web, factures conformes et agent IA, prêts en 30 minutes.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; plan?: string }>;
}) {
  const params = await searchParams;

  async function signUp(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const businessName = String(formData.get("businessName") ?? "");

    try {
      await auth.api.signUpEmail({
        body: { email, password, name: businessName },
        headers: await headers(),
      });
    } catch (error) {
      const message =
        error instanceof APIError ? error.message : "Impossible de créer le compte";
      redirect("/auth/signup?error=" + encodeURIComponent(message));
    }
    redirect("/auth/verify-email");
  }

  return (
    <AuthShell
      title="Créez votre compte"
      subtitle="Gratuit, sans carte bancaire. Prêt en quelques minutes."
    >
      {params.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertContent>
            <AlertDescription>
              {decodeURIComponent(params.error)}
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <form action={signUp} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="businessName">
            Nom de votre entreprise <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            name="businessName"
            type="text"
            required
            autoComplete="organization"
            placeholder="Plomberie Dupont"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email professionnel <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="vous@exemple.fr"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">
            Mot de passe <span className="text-destructive">*</span>
          </Label>
          <PasswordInput
            id="password"
            name="password"
            minLength={10}
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground">Minimum 10 caractères.</p>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Créer mon compte gratuitement
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="S'inscrire avec Google" />

      <p className="mt-6 text-xs text-muted-foreground">
        En créant un compte, vous acceptez les{" "}
        <Link href="/cgu" className="text-primary hover:underline">
          conditions d&apos;utilisation
        </Link>{" "}
        et la{" "}
        <Link href="/confidentialite" className="text-primary hover:underline">
          politique de confidentialité
        </Link>
        .
      </p>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link
          href="/auth/signin"
          className="font-medium text-primary hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
