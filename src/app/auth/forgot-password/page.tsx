/**
 * Request a password reset link.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/better-auth";

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
      // Do not leak whether the address exists.
    }
    redirect("/auth/forgot-password?sent=1");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>

        {params.sent ? (
          <p className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
            Si un compte existe pour cette adresse, un lien de réinitialisation
            vient d&apos;être envoyé.
          </p>
        ) : (
          <form action={requestReset} className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">
              Entrez votre email, nous vous enverrons un lien pour choisir un
              nouveau mot de passe.
            </p>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="vous@exemple.fr"
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Envoyer le lien
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          <a href="/auth/signin" className="font-medium text-blue-600 hover:underline">
            Retour à la connexion
          </a>
        </p>
      </div>
    </div>
  );
}
