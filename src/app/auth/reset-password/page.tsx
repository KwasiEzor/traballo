/**
 * Set a new password from a reset link (?token=...).
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth/better-auth";
import { PasswordInput } from "@/components/auth/password-input";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <Shell>
        <p className="text-sm text-red-800">Lien invalide ou expiré.</p>
        <BackLink />
      </Shell>
    );
  }

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
        error instanceof APIError ? error.message : "Réinitialisation impossible";
      redirect(
        `/auth/reset-password?token=${encodeURIComponent(t)}&error=` +
          encodeURIComponent(message)
      );
    }
    redirect("/auth/signin");
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
      {params.error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(params.error)}
        </p>
      )}
      <form action={resetPassword} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <PasswordInput
          id="password"
          name="password"
          minLength={10}
          autoComplete="new-password"
        />
        <p className="text-xs text-gray-500">Minimum 10 caractères</p>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </form>
      <BackLink />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">{children}</div>
    </div>
  );
}

function BackLink() {
  return (
    <p className="mt-6 text-center text-sm text-gray-600">
      <a href="/auth/signin" className="font-medium text-blue-600 hover:underline">
        Retour à la connexion
      </a>
    </p>
  );
}
