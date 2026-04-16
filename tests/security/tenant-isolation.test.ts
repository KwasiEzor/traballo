/**
 * tests/security/tenant-isolation.test.ts
 *
 * Tests de sécurité — isolation multi-tenant
 * Ces tests vérifient que tenant A ne peut JAMAIS accéder aux données de tenant B.
 *
 * ⚠️  Ces tests nécessitent une instance Supabase locale (pnpm supabase start)
 *     Marqués @integration — lancés séparément en CI
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

// Ces tests seront implémentés quand la DB locale sera configurée
// Ils servent de SPEC pour la sécurité attendue

describe.todo("@integration Isolation multi-tenant RLS", () => {
  describe("invoices", () => {
    it("tenant A ne peut pas lire les factures de tenant B", async () => {
      // Créer 2 tenants avec leurs contextes auth
      // Créer une facture pour tenant B
      // Essayer de la lire avec le contexte de tenant A
      // Résultat attendu : 0 résultats (pas d'erreur, mais données invisibles)
    });

    it("tenant A ne peut pas modifier les factures de tenant B", async () => {
      // Créer une facture pour tenant B
      // Essayer de l'UPDATE avec le contexte de tenant A
      // Résultat attendu : 0 lignes modifiées
    });

    it("tenant A ne peut pas supprimer les factures de tenant B", async () => {
      // Créer une facture pour tenant B
      // Essayer de la DELETE avec le contexte de tenant A
      // Résultat attendu : 0 lignes supprimées
    });
  });

  describe("clients", () => {
    it("tenant A ne peut pas voir les clients de tenant B", async () => {});
    it("tenant A ne peut pas modifier les clients de tenant B", async () => {});
  });

  describe("appointments", () => {
    it("tenant A ne peut pas voir les RDV de tenant B", async () => {});
  });

  describe("ai_conversations", () => {
    it("tenant A ne peut pas accéder aux conversations de tenant B", async () => {});
  });

  describe("service_role bypass", () => {
    it("le service role peut lire toutes les données (pour les crons)", async () => {
      // Vérifier que le service_role (utilisé dans les Vercel Cron Jobs)
      // peut bien accéder à toutes les données pour les rappels automatiques
    });
  });
});
