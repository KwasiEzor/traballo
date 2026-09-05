/**
 * Sign in page — Better Auth email/password
 */

import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth/better-auth";
import { isAdminEmail } from "@/lib/auth/admin";
import { adminHome } from "@/lib/admin/nav";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Connexion" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  async function signIn(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await auth.api.signInEmail({
        body: { email, password },
        headers: await headers(),
      });
    } catch (error) {
      if (error instanceof APIError) {
        if (error.status === 403) redirect("/auth/verify-email");
        redirect("/auth/signin?error=" + encodeURIComponent(error.message));
      }
      redirect(
        "/auth/signin?error=" + encodeURIComponent("Connexion impossible")
      );
    }
    // Super-admins go straight to the console, not the artisan onboarding.
    redirect(isAdminEmail(email) ? adminHome() : "/dashboard");
  }

  return (
    <AuthShell
      title="Connexion à votre espace"
      subtitle="Heureux de vous revoir."
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

      <form action={signIn} className="space-y-4">
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <PasswordInput id="password" name="password" autoComplete="current-password" />
        </div>

        <Button type="submit" size="lg" className="w-full">
          Se connecter
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="Se connecter avec Google" />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Nouveau sur Traballo ?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-primary hover:underline"
        >
          Créer un compte gratuitement
        </Link>
      </p>
    </AuthShell>
  );
}
