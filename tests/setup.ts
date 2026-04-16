/**
 * tests/setup.ts — Configuration globale Vitest
 * Chargé avant chaque fichier de test via setupFiles dans vitest.config.ts
 */

import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

// ─── MSW — Mock Service Worker ─────────────────────────────────────────────
// Intercepte les appels aux APIs externes (Stripe, Resend, Anthropic, Supabase)

beforeAll(() => {
  server.listen({
    onUnhandledRequest: "error", // Échoue si une requête non-mockée est faite
  });
});

afterEach(() => {
  cleanup();           // Nettoyer le DOM après chaque test React
  server.resetHandlers(); // Réinitialiser les handlers MSW modifiés en cours de test
  vi.clearAllMocks();  // Nettoyer tous les mocks Vitest
});

afterAll(() => {
  server.close();
});

// ─── Mocks globaux Next.js ──────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => "/dashboard"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: unknown) => fn),
  cache: vi.fn((fn: unknown) => fn),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Headers()),
}));

// ─── Mock Auth — requireAuth ────────────────────────────────────────────────
// Par défaut : artisan authentifié avec tenantId de test
// Surcharger dans chaque test avec vi.mocked(requireAuth).mockResolvedValue(...)

vi.mock("@/lib/auth/require-auth", () => ({
  requireAuth: vi.fn().mockResolvedValue({
    tenantId: "tenant_test_001",
    userId: "user_test_001",
    plan: "pro",
  }),
}));

// ─── Mock Supabase client ───────────────────────────────────────────────────
// Les tests d'intégration DB utilisent une vraie DB locale (supabase start)
// Les tests unitaires utilisent ce mock

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user_test_001", app_metadata: { tenant_id: "tenant_test_001" } } },
        error: null,
      }),
    },
  })),
}));

// ─── Console — supprimer les erreurs attendues ──────────────────────────────
// Évite le bruit dans les tests qui vérifient les comportements d'erreur

const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  // Ignorer les erreurs React "act()" dans les tests
  if (typeof args[0] === "string" && args[0].includes("act(")) return;
  originalConsoleError(...args);
};
