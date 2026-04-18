/**
 * Supabase admin client with service role key
 * Bypasses RLS - use only for admin operations
 */

import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

/**
 * Admin client that bypasses Row Level Security
 * Use ONLY for:
 * - Creating tenant records during signup
 * - Admin operations that need to bypass RLS
 * - Migration scripts
 *
 * NEVER expose this client to client-side code
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
