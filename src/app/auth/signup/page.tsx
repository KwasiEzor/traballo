/**
 * Sign up page
 * Create new artisan account
 */

import { createClient } from "@/lib/auth/supabase-server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tenants } from "@/db/schema";
import { PasswordInput } from "@/components/auth/password-input";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  async function signUp(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const businessName = formData.get("businessName") as string;

    const supabase = await createClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
        },
      },
    });

    if (authError) {
      redirect("/auth/signup?error=" + encodeURIComponent(authError.message));
    }

    if (!authData.user) {
      redirect("/auth/signup?error=Failed to create user");
    }

    // Create tenant
    const slug = businessName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
      await db.insert(tenants).values({
        id: authData.user.id,
        slug,
        plan: "free",
      });
    } catch (error) {
      console.error("Failed to create tenant:", error);
      redirect(
        "/auth/signup?error=" +
          encodeURIComponent("Database error: Failed to create tenant")
      );
    }

    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Traballo</h1>
            <p className="mt-2 text-sm text-gray-600">
              Créez votre compte artisan en quelques secondes
            </p>
          </div>

          {/* Error Message */}
          {params.error && (
            <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="ml-3 text-sm text-red-800">
                  {decodeURIComponent(params.error)}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form action={signUp} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-gray-700"
              >
                Nom de votre entreprise <span className="text-red-500">*</span>
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Plomberie Dupont"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email professionnel <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="vous@exemple.fr"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <PasswordInput
                  id="password"
                  name="password"
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Minimum 6 caractères
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
            >
              Créer mon compte gratuitement
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Déjà un compte ?{" "}
            <a
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Se connecter
            </a>
          </p>

          <p className="mt-4 text-center text-xs text-gray-500">
            En créant un compte, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}
