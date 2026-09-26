# STATE — état courant du projet

> Mis à jour à chaque fin de session. Toute affirmation ici est **à revérifier** avant d'agir
> (git, `pnpm db:audit:live`, tests). En cas d'écart avec la réalité, la réalité gagne : corriger ce fichier.

**Dernière vérification : 2026-09-26** (`origin/main` = `0783f32` ; `pnpm check` vert, 180 tests ; prod Vercel construite depuis `0783f32`)

Du travail arrive aussi par des sessions Claude web (PR mergées sur GitHub) : **`git fetch` avant toute vérification**, la copie locale peut être en retard.

## Objectif en cours

Système de notifications — voir `NOTIFICATIONS_PLAN.md`. Priorités bêta : `BETA_LAUNCH_PLAN.md` (phases 0→3 notifications ≈ 4,5 j avant ouverture à des artisans réels, puis observabilité Sentry + PostHog, tiers gratuits).

## Fait

- 2026-09-16 → 18 (PR #2 à #14) : mascotte + design system motion (`docs/design/MOTION_PRINCIPLES.md`), refonte pricing et section « Le constat », prestations par défaut par métier, sous-domaine `<slug>.traballo.pro` personnalisable, revalidation du cache du site public, photo hero et bannière CTA qui suivent le métier, lien « retour à l'accueil » des pages d'auth corrigé.

- Phase 0 : schéma `notifications` + `notification_deliveries`, `createNotification`, catalogue de types (commit `f7d7f09`).
- Événements câblés : `leads.site_enquiry`, `leads.ai_lead`, `billing.payment_failed` (commit `b8ffe1c`).
- Phase 1a **en production** le 2026-09-26 (PR #16, commit `0783f32`) : cloche dans la topbar, page `/dashboard/notifications` (filtre, pagination), marquer lu / tout marquer lu. Requêtes vérifiées contre Postgres sous RLS dans une transaction annulée, isolation inter-tenant incluse ; cloche vue à l'écran par l'utilisateur sur `app.traballo.pro`. Au 2026-09-26 matin, la base ne contenait **aucune** notification.
- Socle agent (2026-09-25) : `docs/STATE.md`, `docs/DECISIONS.md`, `.claude/rules/`, skills `resume` / `wrap-up`, hooks (`.claude/hooks/`), CI GitHub Actions, protection de `main`.
- Migrations 0000 → 0011 **toutes enregistrées en base** (vérifié le 2026-09-25 via `pnpm db:audit:live`), dont 0010 (notifications) et 0011 (lat/long profils).
- Anti-abus formulaires publics : Turnstile, rate limit, honeypot, plafond de leads par tenant/jour (voir `docs/SECURITY_FORMS.md`).
- Signal bêta (`NEXT_PUBLIC_SITE_PHASE`).

## Prochaine action exacte

1. **Décisions à obtenir de l'utilisateur avant de coder la Phase 1b** (proposées, non tranchées) :
   - canaux réglables : in-app + email, par catégorie (`leads`, `invoices`, `appointments`) ; `billing` verrouillée (transactionnel) ; push reporté en Phase 5 ;
   - l'email « nouvelle demande de contact » reste **toujours actif** (recommandé : le couper ferait rater des clients).
2. Phase 1b — préférences, sur une branche `feat/notifications-prefs` (tests d'abord) : migration `notification_prefs` (RLS + policies comme 0010), `src/lib/notifications/prefs.ts` (lecture + merge des défauts, `db.select()` core), onglet Notifications dans `/dashboard/settings`, prise en compte dans `createNotification` via `resolveChannels`. **La migration touche la base partagée dev/prod : `pnpm db:audit:live` avant et après, confirmation de l'utilisateur.**
3. Puis Phase 2 (emails abonnement) et Phase 3 (relances factures + cron), voir `NOTIFICATIONS_PLAN.md`.

Les notifs `leads.*` n'ont pas d'`actionUrl` : il n'existe pas encore de page « boîte de leads ».

## Ouvert — bloquant produit

- **Numérotation des factures** : lecture puis incrément (race), aucun `UNIQUE(tenant_id, invoice_number)`, pas de séquence légale sans trou (`create-invoice.ts`, `schema/invoices.ts`).
- **PDF en base64 dans la DB** : `generate-pdf.ts` écrit un data URL dans `invoices.pdf_url`. Migrer vers Vercel Blob.
- **Domaine custom** : `src/middleware.ts` ne résout pas `sites.custom_domain` (aucune référence trouvée), alors que `CLAUDE.md` l'annonce.
- **CI active** : `.github/workflows/ci.yml` lance `pnpm check` sur PR et push `main`. Premier run vert le 2026-09-25 (run `36191750104`, 43 s). **`main` protégée** le 2026-09-25 : PR obligatoire, check CI requis, s'applique aussi aux admins, force-push et suppression interdits (push direct testé : refusé). Restent : `test:security` (isolation RLS) n'y tourne pas, il exige une DB ; actions en Node 20 dépréciées (forcées en Node 24, sans effet pour l'instant).
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
