# STATE — état courant du projet

> Mis à jour à chaque fin de session. Toute affirmation ici est **à revérifier** avant d'agir
> (git, `pnpm db:audit:live`, tests). En cas d'écart avec la réalité, la réalité gagne : corriger ce fichier.

**Dernière vérification : 2026-09-25** (HEAD `da23c2a`, working tree propre)

## Objectif en cours

Système de notifications — voir `NOTIFICATIONS_PLAN.md`.

## Fait

- Phase 0 : schéma `notifications` + `notification_deliveries`, `createNotification`, catalogue de types (commit `f7d7f09`).
- Événements câblés : `leads.site_enquiry`, `leads.ai_lead`, `billing.payment_failed` (commit `b8ffe1c`). Les lignes s'écrivent, rien ne les affiche encore.
- Migrations 0000 → 0011 **toutes enregistrées en base** (vérifié le 2026-09-25 via `pnpm db:audit:live`), dont 0010 (notifications) et 0011 (lat/long profils).
- Anti-abus formulaires publics : Turnstile, rate limit, honeypot, plafond de leads par tenant/jour (voir `docs/SECURITY_FORMS.md`).
- Signal bêta (`NEXT_PUBLIC_SITE_PHASE`).

## Prochaine action exacte

Notifications Phase 1 (écrire les tests d'abord, RED) :

1. Cloche dans `src/components/dashboard/topbar.tsx` (cluster `ml-auto`, à côté de UpgradeButton / ThemeToggle / UserMenu).
2. Page `/dashboard/notifications`.
3. `markRead` / `markAllRead` via `withTenant` (RLS).
4. Onglet Notifications dans `/dashboard/settings` (matrice email / in-app / push par catégorie).

Les notifs `leads.*` n'ont pas d'`actionUrl` : il n'existe pas encore de page « boîte de leads ».

## Ouvert — bloquant produit

- **Numérotation des factures** : lecture puis incrément (race), aucun `UNIQUE(tenant_id, invoice_number)`, pas de séquence légale sans trou (`create-invoice.ts`, `schema/invoices.ts`).
- **PDF en base64 dans la DB** : `generate-pdf.ts` écrit un data URL dans `invoices.pdf_url`. Migrer vers Vercel Blob.
- **Domaine custom** : `src/middleware.ts` ne résout pas `sites.custom_domain` (aucune référence trouvée), alors que `CLAUDE.md` l'annonce.
- **Pas de CI** : aucun `.github/workflows`. Cible : `pnpm check` sur chaque PR.
- **Couverture de tests** ~11 % constatée à l'audit du 2026-09-03 (seuil 80 %). Non remesurée.

## Ouvert — infra / actions manuelles (non revérifié depuis le 2026-09-07)

- La prod utilise la **branche Neon partagée dev** (us-east-2). Créer un projet Neon EU (eu-central-1, RGPD), `pnpm db:migrate`, re-sync `DATABASE_URL*`.
- Ajouter `https://app.traballo.pro/api/auth/callback/google` au client OAuth Google.
- Cloudflare : reconfigurer le widget Turnstile avec la validation de hostname **désactivée** (une clé pour `*.traballo.pro` + domaines custom).
- Vercel : règle Firewall de rate limit sur `POST /api/agent*` et l'action de lead ; activer BotID.
- Stripe : mode test complet et vérifié E2E ; **compte non activé en live** (`charges_enabled: false`). Live = onboarding Stripe par l'utilisateur + relancer `scripts/stripe-provision.ts` avec la clé live.
- Stadia Maps : allow-lister `traballo.pro` + `*.traballo.pro` dans leur dashboard (auth par domaine des tuiles).
- Deux stores Blob orphelins à supprimer dans le dashboard Vercel : `traballo-blob`, `traballo-assets`.
- Passage en GA : `NEXT_PUBLIC_SITE_PHASE=ga` sur Vercel + redeploy (aucun changement de code).

## Pas encore construit

Console admin phases C/D (feature flags, plans en DB, annonces, modération, MFA admin) · slots de RDV proposés par l'agent IA · canal WhatsApp · export RGPD.

## Pièges

Voir `.claude/rules/` (`db.md`, `dev-workflow.md`, `client-server.md`, `security.md`).
