# Traballo

> Le business pack des artisans francophones — France · Belgique · Luxembourg.

SaaS multi-tenant qui donne à chaque artisan, en un seul abonnement : un site
web public, la facturation conforme (Factur-X), un agent IA de prise de contact,
la gestion des rendez-vous et des clients.

**Production :** [www.traballo.pro](https://www.traballo.pro) ·
dashboard artisan `app.traballo.pro` · console admin `admin.traballo.pro` ·
site artisan `<slug>.traballo.pro`

---

## Aperçu

| Landing | Fonctionnalités |
|---|---|
| [![Landing](docs/screenshots/landing.png)](docs/screenshots/landing.png) | [![Fonctionnalités](docs/screenshots/fonctionnalites.png)](docs/screenshots/fonctionnalites.png) |

| Tarifs | Site artisan public |
|---|---|
| [![Tarifs](docs/screenshots/tarifs.png)](docs/screenshots/tarifs.png) | [![Site artisan](docs/screenshots/site-artisan.png)](docs/screenshots/site-artisan.png) |

| Dashboard artisan | Console super-admin |
|---|---|
| _à venir_ | _à venir_ |

<sub>Captures publiques régénérables : `pnpm tsx scripts/screenshots.ts`.</sub>

---

## Stack

| Domaine | Choix |
|---|---|
| Framework | Next.js 15 (App Router, React 19, TypeScript strict) |
| Style | Tailwind CSS v4 (`@theme inline`, tokens OKLCH) · shadcn/ui |
| Base de données | Neon Postgres (serverless) · Drizzle ORM · RLS Postgres |
| Auth | Better Auth (e-mail/mot de passe, Google, magic link, vérification e-mail) |
| Paiement | Stripe (Checkout abonnement, portail client, webhooks) |
| E-mail | Resend + React Email (shell de marque partagé) |
| IA | Anthropic SDK — `claude-haiku-4-5` (agent site + assistant marketing) |
| Hébergement | Vercel (Fluid Compute) |
| Anti-spam | Cloudflare Turnstile |
| Tests | Vitest (unit + intégration) · Playwright (e2e) · MSW |

---

## Fonctionnalités livrées

- **Sites publics artisans** — templates, éditeur de contenu, domaine
  personnalisé, SEO (`sitemap`, `robots`, OpenGraph), formulaire de contact.
- **Facturation** — factures, lignes, PDF, envoi e-mail au client, statuts
  (`draft → sent → viewed → paid → overdue`).
- **Rendez-vous & disponibilités** — agenda artisan, créneaux hebdomadaires.
- **Carnet de clients**.
- **Agent IA** (plan Business) — assistant conversationnel sur le site de
  l'artisan, streaming, quotas, capture de lead → e-mail + notification.
- **Assistant IA marketing** — Q&R produit + capture de lead sur le site
  Traballo.
- **Abonnements Stripe** — plans Free / Pro / Business, mensuel + annuel,
  Checkout, portail client, provisionnement via webhook, e-mail d'échec de
  paiement + dunning.
- **Console super-admin** — métriques & graphiques (MRR, funnel, cohortes),
  gestion des tenants, impersonation signée (bannière + journal d'audit),
  export CSV, clé API Anthropic configurable.
- **E-mails transactionnels** — shell de marque commun : vérification,
  réinitialisation, magic link, bienvenue, facture, lead, échec de paiement.
- **Notifications** — socle livré (table `notifications`, `createNotification`,
  gating par plan) ; centre in-app + relances factures + rappels RDV en cours.
  Voir [`NOTIFICATIONS_PLAN.md`](./NOTIFICATIONS_PLAN.md).
- **Thème clair/sombre**, PWA (manifest + icônes).

---

## Architecture

### Routage multi-tenant (`src/middleware.ts`)

| Hôte | Sert |
|---|---|
| `app.traballo.pro` | dashboard artisan → `/dashboard/*` |
| `admin.traballo.pro` | console super-admin → `/admin/*` |
| `<slug>.traballo.pro` | site public de l'artisan → `/sites/[slug]/*` |
| domaine custom | résolu via `sites.custom_domain` |

Les sessions `app.` et `admin.` sont distinctes (cookies host-only, pas de
partage cross-sous-domaine).

### Isolation des données

- Toute logique tenant passe par `withTenant(tenantId, …)` /
  `getTenantDb()` (`src/lib/db/tenant.ts`) — la transaction bascule dans le
  rôle `authenticated` et pose `app.current_tenant_id` pour la RLS.
- `db` (export de `src/lib/db`) = connexion propriétaire Neon, **bypass RLS** —
  réservée à l'auth bootstrap, aux migrations, aux scripts, aux webhooks.
- Chaque table tenant a une policy `tenant_isolation` + un index sur
  `tenant_id`. Tests : `pnpm test:security`.

### Pièges connus (voir `CLAUDE.md`)

- Le **query builder relationnel Drizzle** (`db.query.X.findFirst`) peut se
  bloquer à travers le pooler Neon pour certaines tables — préférer
  `db.select()` côté fiabilité.
- Les **bind params de `sql\`\``** doivent être des chaînes ISO, pas des
  `Date` (postgres-js `prepare: false`).

---

## Démarrage local

```bash
pnpm install
cp .env.example .env.local   # puis remplir (voir DEPLOYMENT.md)
pnpm db:migrate              # applique les migrations Drizzle
pnpm dev                     # http://localhost:3000
```

Variables d'environnement requises : `DATABASE_URL` (poolée),
`DATABASE_URL_UNPOOLED` (directe), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ROOT_DOMAIN`, `RESEND_API_KEY`,
`EMAIL_FROM`, `ADMIN_EMAILS`. Optionnelles : `GOOGLE_CLIENT_ID/SECRET`,
`ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`STRIPE_PRICE_{PRO,BUSINESS}_{MONTH,YEAR}`, `TURNSTILE_SITE_KEY/SECRET`,
`BLOB_READ_WRITE_TOKEN`. Liste complète et synchro Vercel :
[`scripts/vercel-env-sync.sh`](./scripts/vercel-env-sync.sh).

---

## Scripts

```bash
pnpm dev              # serveur de développement (Turbopack)
pnpm build            # build production
pnpm test             # Vitest (unit + intégration)
pnpm test:e2e         # Playwright
pnpm test:security    # tests d'isolation multi-tenant (RUN_DB_SECURITY_TESTS=1)
pnpm typecheck        # next typegen && tsc --noEmit
pnpm lint             # ESLint + Prettier
pnpm check            # db:audit + typecheck + lint + test
pnpm db:generate      # génère une migration depuis le schéma
pnpm db:migrate       # applique les migrations
pnpm db:studio        # GUI Drizzle
```

---

## Workflow

- **TDD** : écrire le test avant le code (RED → GREEN → refactor).
- **Commit après chaque étape significative** (feature fonctionnelle,
  migration, fix critique). Ne pas committer du code qui ne compile pas ou
  des tests qui échouent.
- Une table = un fichier dans `src/db/schema/`. Toujours RLS + index
  `tenant_id` sur les tables tenant.
- Server Actions : suffixe `Action`, toujours try/catch, validation Zod.

---

## Documentation

| Fichier | Contenu |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | mémoire projet — architecture critique, conventions, sécurité |
| [`traballo-prd.md`](./traballo-prd.md) | product requirements (TRB-XXX) |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | déploiement Vercel + DNS + Stripe + Resend |
| [`AUDIT.md`](./AUDIT.md) | audit sécurité / dette technique |
| [`IMPROVEMENT_PLAN.md`](./IMPROVEMENT_PLAN.md) | plan de durcissement |
| [`NOTIFICATIONS_PLAN.md`](./NOTIFICATIONS_PLAN.md) | plan du système de notifications |

---

## Développement IA-assisté

Le dépôt est pensé pour Claude Code : [`CLAUDE.md`](./CLAUDE.md) (mémoire
projet chargée à chaque session — architecture critique, conventions, règles
de sécurité), un `CLAUDE.md` contextuel dans `src/app/api/`, et
[`.claude/launch.json`](./.claude/launch.json) pour le serveur de preview.
Lancer `claude` à la racine du projet.
