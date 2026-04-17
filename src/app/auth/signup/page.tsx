/**
 * Sign up page
 * Create new artisan account
 */

import { createClient } from "@/lib/auth/supabase-server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tenants } from "@/db/schema";

export default function SignUpPage() {
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

    await db.insert(tenants).values({
      id: authData.user.id,
      slug,
      plan: "free",
    });

    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Traballo</h1>
          <p className="mt-2 text-gray-600">Créer mon compte artisan</p>
        </div>

        <form action={signUp} className="mt-8 space-y-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Nom de votre entreprise
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Plomberie Dupont"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="vous@exemple.fr"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="••••••••"
            />
            <p className="mt-1 text-sm text-gray-500">Minimum 6 caractères</p>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Créer mon compte
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Déjà un compte ?{" "}
          <a href="/auth/signin" className="text-blue-600 hover:text-blue-500">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
