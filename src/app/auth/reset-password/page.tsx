import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth/better-auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  async function resetPassword(formData: FormData) {
    "use server";
    const newPassword = String(formData.get("password") ?? "");
    const t = String(formData.get("token") ?? "");
    try {
      await auth.api.resetPassword({
        body: { newPassword, token: t },
        headers: await headers(),
      });
    } catch (error) {
      const message =
        error instanceof APIError
          ? error.message
          : "Réinitialisation impossible";
      redirect(
        `/auth/reset-password?token=${encodeURIComponent(t)}&error=` +
          encodeURIComponent(message)
      );
    }
    redirect("/auth/signin");
  }

  return (
    <AuthShell title="Choisissez un nouveau mot de passe">
      {!token ? (
        <Alert variant="destructive">
          <AlertContent>
            <AlertDescription>
              Ce lien est invalide ou a expiré. Demandez-en un nouveau depuis la
              page « mot de passe oublié ».
            </AlertDescription>
          </AlertContent>
        </Alert>
      ) : (
        <form action={resetPassword} className="space-y-4">
          {params.error && (
            <Alert variant="destructive">
              <AlertContent>
                <AlertDescription>
                  {decodeURIComponent(params.error)}
                </AlertDescription>
              </AlertContent>
            </Alert>
          )}
          <input type="hidden" name="token" value={token} />
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none"
            >
              Nouveau mot de passe
            </label>
            <PasswordInput
              id="password"
              name="password"
              minLength={10}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Minimum 10 caractères.</p>
          </div>
          <Button type="submit" size="lg" className="w-full">
            Enregistrer
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
