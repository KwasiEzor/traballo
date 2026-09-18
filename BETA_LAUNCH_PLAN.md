# Beta Launch Plan

## Contexte

Suivi de la mise en ligne du correctif "retour à l'accueil" sur les pages
d'authentification, et préparation de l'instrumentation observabilité
(erreurs + analytics produit) pour la phase bêta.

## Fait

1. **Fix `AuthShell`** — les liens "Retour à l'accueil" et logo sur
   `/auth/*` pointaient vers `href="/"`, réécrit par le middleware en
   `/dashboard/` sur `app.traballo.pro` (route protégée) : un visiteur non
   connecté rebondissait sur `/auth/signin` au lieu d'atteindre la page
   d'accueil marketing. Corrigé pour pointer explicitement vers
   `https://<NEXT_PUBLIC_ROOT_DOMAIN>`. Test de régression ajouté
   (`tests/components/auth-shell.test.tsx`).
2. **PR [#8](https://github.com/KwasiEzor/traballo/pull/8)** — créée,
   mergée dans `main` (commit `e6cb52d`), déployée en production sur
   Vercel (`traballo.pro`, `www.traballo.pro`, `app.traballo.pro`).

## À faire — Notifications (plan détaillé existant)

Le plan d'implémentation détaillé du système de notifications
(**[`NOTIFICATIONS_PLAN.md`](./NOTIFICATIONS_PLAN.md)**, déjà commité sur
`main`) couvre les phases **0 à 9**. Statut actuel :

| Phase | Contenu | État |
|---|---|---|
| 0 | Fondations (schéma, `createNotification`, câblage événements existants) | ✅ fait |
| 1 | Centre in-app artisan (cloche + page + préférences) | ✅ fait — migration 0012 appliquée |
| 2 | Emails abonnement manquants (activé/changé/annulé, quota) | ✅ fait |
| 3 | Relances de factures + cron (TRB-056→060) | ✅ fait — migration 0013 à appliquer, `CRON_SECRET` à définir |
| 4b | Rappels RDV créés dans le dashboard + TRB-071 (TRB-087, 094→098) | ✅ fait — cron quotidien (Hobby confirmé), pas de rappel « 1h avant » précis |
| 4a | Prise de RDV publique | non commencée |
| 5 | Web push PWA (TRB-115) | ✅ fait — migration 0014 à appliquer, clés VAPID à générer (`npx web-push generate-vapid-keys`) |
| 6 | SMS Business (100/mois) | à faire |
| 7→9 | WhatsApp, notifs opérateur, annonces système | plus tard |

**Pour la bêta** : le bloc à plus forte valeur (phases 0→3 — centre in-app +
transactionnel complet + relances factures), estimé à ~4,5 jours dans le
plan détaillé et identifié comme le socle recommandé avant l'ouverture
d'une bêta avec des artisans réels, **est fait**. Reste à appliquer la
migration 0013 (`pnpm db:migrate`) et définir `CRON_SECRET` en prod avant
déploiement. Les phases 4 (RDV), 5 (push) et au-delà peuvent suivre en
itération. Décisions encore ouvertes avant de coder la suite : plan Vercel
(cron horaire pour la Phase 4 — Hobby ne suffit plus), prise de RDV
publique, fournisseur SMS — voir §8 de `NOTIFICATIONS_PLAN.md`.

## Fait — Observabilité bêta (Sentry + PostHog)

Les deux intégrations Vercel Marketplace sont installées et connectées au
projet (variables d'env injectées automatiquement). Câblage applicatif fait :

- **Sentry** — `sentry.server.config.ts`, `sentry.edge.config.ts`,
  `src/instrumentation.ts` (+ `onRequestError`), `src/instrumentation-client.ts`
  (+ capture des transitions de route), `src/app/global-error.tsx` (erreurs de
  rendu React non rattrapées), `next.config.ts` enveloppé par
  `withSentryConfig` (upload des source maps au build via `SENTRY_AUTH_TOKEN`).
  N'émet rien si `NEXT_PUBLIC_SENTRY_DSN` est absent (safe en dev local).
  **Fix critique** : `Sentry.captureRequestError` planifie son flush via
  `vercelWaitUntil()` (`@sentry/core`), qui ne fait rien hors runtime Edge
  (`if (typeof EdgeRuntime !== "string") return;`) — sur le runtime Node.js
  (toutes les routes de cette app), la requête HTTP vers l'ingest Sentry
  n'avait donc aucune garantie de se terminer avant que la lambda ne gèle
  juste après la réponse, et l'événement pouvait être perdu ou très en
  retard (constaté : 33 min sur un test). `src/instrumentation.ts` enveloppe
  désormais `onRequestError` pour forcer `Sentry.flush()` via `after()`
  (`next/server`, fonctionne sur les deux runtimes). Root cause confirmée
  en lisant le SDK installé + confirmée empiriquement qu'un événement
  déclenché finit par apparaître dans Sentry (33 min de retard sans le
  fix, via une route de diagnostic temporaire) ; la livraison rapide et
  fiable *après* fix reste à confirmer sur un prochain événement réel.
- **PostHog** — `src/components/posthog-provider.tsx` (client component),
  monté dans `src/app/layout.tsx`. Pageviews automatiques sur navigation
  App Router (`capture_pageview: "history_change"`), `person_profiles:
  "identified_only"`. N'initialise rien si `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
  est absent.

Aucun événement produit custom câblé pour l'instant (funnels signup/facture
envoyée/etc.) — à faire au fil de l'eau selon les besoins d'analyse.

### Sentry (erreurs + performance)

- Plan **Developer (gratuit)** : 5 000 erreurs/mois + 10 000 unités de
  performance/mois, 1 utilisateur, rétention 30 jours. Le quota erreurs et
  transactions est partagé.
- Plan **Team** : à partir de **26 $/mois** (facturation annuelle, 29 $/mois
  en mensuel) pour 50 000 erreurs + 5M spans inclus, puis dépassement
  facturé à l'usage (~0,00029 $/erreur au-delà).
- Plan **Business** : à partir de **80 $/mois** (facturation annuelle,
  89 $/mois en mensuel) — mêmes quotas de base que Team, ajoute SSO/SAML,
  audit logs, rétention étendue.
- **Recommandation bêta** : démarrer sur le plan Developer gratuit. Pour un
  petit groupe d'artisans testeurs (quelques dizaines à ~100 utilisateurs
  actifs), 5 000 erreurs/mois suffisent largement en usage normal. Passer
  au plan Team (~26 $/mois) seulement si le volume d'erreurs dépasse le
  quota gratuit, ou si un deuxième compte utilisateur est nécessaire.

### PostHog (analytics produit + session replay + feature flags)

- **Tier gratuit** : 1M événements analytics/mois, 5 000 session
  replays/mois, 1M requêtes feature flags/mois — sans carte bancaire.
  PostHog indique que ~97 % des comptes restent sur ce tier.
- Au-delà du gratuit, facturation à l'usage, dégressive par palier :
  - **Analytics produit** : ~0,00005 $/événement (1-2M), puis dégressif
    jusqu'à ~0,000009 $/événement au-delà de 250M.
  - **Session replay** : ~0,005 $/enregistrement (5-15K), dégressif jusqu'à
    ~0,0015 $/enregistrement au-delà de 500K.
  - **Feature flags** : ~0,0001 $/requête (1-2M), dégressif jusqu'à
    ~0,00001 $/requête au-delà de 50M.
- **Recommandation bêta** : le tier gratuit couvre très confortablement une
  bêta fermée ou un lancement progressif (le seuil de 1M événements/mois
  correspond à un volume d'usage largement au-dessus de ce qu'une poignée
  d'artisans testeurs générera). Coût attendu en bêta : **0 €**.

### Estimation coût combiné bêta (échelle réduite : dizaines/petites
centaines d'utilisateurs actifs)

| Service  | Plan recommandé | Coût mensuel estimé |
| -------- | ---------------- | -------------------- |
| Sentry   | Developer (gratuit) | 0 $ |
| PostHog  | Free tier | 0 $ |
| **Total** | | **0 $/mois** |

À surveiller pour déclencher un upgrade :
- Sentry : volume d'erreurs approchant 5 000/mois, ou besoin d'un second
  compte/rôle admin → passer à Team (~26 $/mois).
- PostHog : volume d'événements approchant 1M/mois ou de session replays
  approchant 5 000/mois → basculer sur facturation à l'usage (coût encore
  marginal aux volumes bêta, de l'ordre de quelques dizaines de $/mois).

*Sources : recherche web du 2026-09-17, pricing sujet à changement — à
revérifier sur sentry.io/pricing et posthog.com/pricing avant décision
finale de budget.*
