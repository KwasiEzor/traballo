# STATE — état courant du projet

> Mis à jour à chaque fin de session. Toute affirmation ici est **à revérifier** avant d'agir
> (git, `pnpm db:audit:live`, tests). En cas d'écart avec la réalité, la réalité gagne : corriger ce fichier.

**Dernière vérification : 2026-09-26** (`origin/main` = `4797f2e` ; `pnpm check` code de sortie 0, 379 tests ; `db:audit:live` 15/15 ; `app.traballo.pro` servi par le déploiement Production de `4797f2e` ; `vercel crons ls` : 2 crons enregistrés)

Du travail arrive aussi par des sessions Claude web (PR mergées sur GitHub) : **`git fetch` avant toute vérification**, la copie locale peut être en retard. Quand l'utilisateur annonce un merge, **le vérifier** (`gh pr view <n> --json state`) : le 2026-09-26, plusieurs merges annoncés n'avaient pas abouti (CI en cours ou rouge).

## Objectif en cours

Ouverture de la bêta — `BETA_LAUNCH_PLAN.md`. Le socle notifications recommandé avant la bêta (phases 0→3) est **en production**, la phase 4 aussi. Reste sur le chemin critique : les prérequis prod ci-dessous, puis l'observabilité (Sentry + PostHog).

## Fait

- **Notifications** (`NOTIFICATIONS_PLAN.md`, décisions dans `docs/DECISIONS.md`), toutes **en production** le 2026-09-26 :
  - Phase 0 + câblage leads / paiement échoué (`f7d7f09`, `b8ffe1c`).
  - 1a cloche + page (PR #16, `0783f32`) ; 1b préférences in-app / e-mail par catégorie + lien sidebar (PR #18, `e0baf23`, migration 0012).
  - 2a e-mails + in-app abonnement activé / changé / annulé, une transition = un envoi (PR #20, `197b6b1`). 2b sans objet (aucun quota réel).
  - 3a relances factures J+7 / J+30 white-label, statut `overdue`, cron 07:00 UTC (PR #21, `9c32f59`, migration 0013) ; 3b bouton « Relancer », IBAN dans les e-mails, suspension par facture, PDF réellement joint (PR #22, `aebac65`, migration 0014).
  - 4 rendez-vous : heure de Paris (bug de fuseau corrigé), confirmation / annulation au client avec `.ics`, cron 16:00 UTC (rappel client J-1 + récap artisan) (PR #23, `4797f2e`, sans migration).
  - Vérifications : jobs et verrous exécutés sur la vraie base avec le tenant QA, parcours vus à l'écran avec le compte QA. **Aucun e-mail réellement reçu** (voir Resend ci-dessous).
- Compte QA `qa-claude@traballo.test` (PR #19) : `.claude/rules/dev-workflow.md`, section Compte QA.
- Migrations 0000 → 0014 toutes enregistrées en base (`db:audit:live` 15/15 le 2026-09-26).
- 2026-09-16 → 18 (PR #2 à #14) : mascotte + design system motion, refonte pricing, prestations par métier, sous-domaine personnalisable, cache du site public, photo hero / bannière CTA par métier.
- Socle agent (2026-09-25) : `STATE.md`, `DECISIONS.md`, `.claude/rules/`, skills `resume` / `wrap-up`, hooks, CI GitHub Actions, protection de `main`.
- Anti-abus formulaires publics (Turnstile, rate limit, honeypot, plafond de leads) ; signal bêta (`NEXT_PUBLIC_SITE_PHASE`).

## Prochaine action exacte

1. **Prérequis prod (utilisateur)** — sans eux, rien de ce qui a été livré le 2026-09-26 n'envoie quoi que ce soit :
   - ajouter `CRON_SECRET` (valeur aléatoire) dans Vercel, environnement Production ; vérifier ensuite `vercel env ls production` puis, le lendemain, les logs des deux crons (200 au lieu de 503) ;
   - vérifier le domaine `traballo.pro` dans Resend ; tester avec « Mot de passe oublié » sur `app.traballo.pro` vers une vraie adresse.
2. **Observabilité bêta** (chemin critique, `BETA_LAUNCH_PLAN.md`) : Sentry (plan Developer gratuit) + PostHog (free tier). Cadrer avant de coder.
3. Puis, en itération : Phase 4b (TRB-071, nouvelle conversation IA → artisan, Business), Phase 5 (web push).

Les notifs `leads.*` n'ont pas d'`actionUrl` : il n'existe pas encore de page « boîte de leads ».

## Ouvert — bloquant produit

- **`CRON_SECRET` absent en Production** (revérifié le 2026-09-26 soir, `vercel env ls`) : les deux crons (`invoice-reminders`, `appointment-reminders`) répondent 503.
- **E-mails Resend** : la clé de `.env.local` reçoit `403 — The traballo.pro domain is not verified`. Clé de prod **non vérifiée** : si elle est dans le même cas, aucun e-mail ne part (inscription, leads, abonnement, relances, RDV).
- **IBAN absent du PDF de facture** (`src/lib/pdf/invoice-template.tsx`) : il n'est que dans les e-mails depuis la 3b.
- **Limite Free « 10 factures / mois »** annoncée (tarifs, FAQ) mais **non appliquée**. À trancher avant la GA : appliquer ou retirer.
- **Quota de l'agent IA** (50 Free / 500 Pro dans `/api/agent`) : code mort, l'agent est réservé au plan Business, illimité.
- **Numérotation des factures** : lecture puis incrément (race), aucun `UNIQUE(tenant_id, invoice_number)`, pas de séquence légale sans trou.
- **PDF en base64 dans la DB** (`invoices.pdf_url`) : migrer vers Vercel Blob.
- **Domaine custom** : `src/middleware.ts` ne résout pas `sites.custom_domain`, alors que `CLAUDE.md` l'annonce.
- **CI** : `test:security` (isolation RLS) n'y tourne pas, il exige une DB ; actions en Node 20 dépréciées.
- **Couverture de tests** ~11 % à l'audit du 2026-09-03 (seuil 80 %). Non remesurée.

## Ouvert — infra / actions manuelles (non revérifié depuis le 2026-09-07)

- La prod utilise la **branche Neon partagée dev** (us-east-2). Créer un projet Neon EU (eu-central-1, RGPD), `pnpm db:migrate`, re-sync `DATABASE_URL*`.
- Ajouter `https://app.traballo.pro/api/auth/callback/google` au client OAuth Google.
- Cloudflare : reconfigurer le widget Turnstile avec la validation de hostname **désactivée**.
- Vercel : règle Firewall de rate limit sur `POST /api/agent*` et l'action de lead ; activer BotID.
- Stripe : mode test vérifié E2E ; **compte non activé en live** (`charges_enabled: false`).
- Stadia Maps : allow-lister `traballo.pro` + `*.traballo.pro`.
- Deux stores Blob orphelins à supprimer : `traballo-blob`, `traballo-assets`.
- Passage en GA : `NEXT_PUBLIC_SITE_PHASE=ga` sur Vercel + redeploy.

## Pas encore construit

Console admin phases C/D · prise de RDV publique · rappel RDV « 1 h avant » (cron horaire ou push) · slots de RDV proposés par l'agent IA · canal WhatsApp · export RGPD.

## Pièges

Voir `.claude/rules/` (`db.md`, `dev-workflow.md`, `client-server.md`, `security.md`, `tdd.md`).
