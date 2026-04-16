# Traballo — Project Memory

> SaaS multi-tenant pour artisans francophones (FR/BE/LU).
> Stack : Next.js 15 · Supabase · Vercel · Stripe · Resend · Anthropic · Tailwind · shadcn/ui · Drizzle ORM

## Commandes essentielles

```bash
pnpm dev           # dev server sur http://localhost:3000
pnpm build         # build production
pnpm test          # vitest (unit + integration)
pnpm test:e2e      # playwright
pnpm db:migrate    # drizzle-kit migrate
pnpm db:studio     # drizzle-kit studio (GUI DB)
pnpm lint          # eslint + prettier check
pnpm typecheck     # tsc --noEmit
```

## Architecture critique — à connaître absolument

### Multi-tenant routing (middleware.ts)
- `app.traballo.be` → dashboard artisan (`/dashboard/*`)
- `admin.traballo.be` → super admin (`/admin/*`)
- `[slug].traballo.be` → site public artisan (`/sites/[slug]/*`)
- domaine custom → résolu via table `sites.custom_domain` en DB

### Isolation des données
- **TOUJOURS** utiliser `getTenantId()` depuis `src/lib/auth/tenant.ts`
- **JAMAIS** de requête DB sans `where tenant_id = $tenantId`
- Les policies RLS Supabase sont le dernier garde-fou, pas le seul
- Tester l'isolation avec `pnpm test:isolation`

### Variables d'environnement requises
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # serveur uniquement — jamais au client
ANTHROPIC_API_KEY              # serveur uniquement
STRIPE_SECRET_KEY              # serveur uniquement
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
NEXT_PUBLIC_APP_URL            # ex: https://app.traballo.be
NEXT_PUBLIC_ROOT_DOMAIN        # traballo.be
```

## Conventions de code

### Fichiers et dossiers
```
src/
  app/                   # Next.js App Router
    (dashboard)/         # routes dashboard artisan (auth requise)
    (public)/            # sites publics artisans (pas d'auth)
    (admin)/             # super admin (auth admin)
    api/                 # API Routes
  components/
    ui/                  # shadcn/ui components (ne pas modifier)
    shared/              # composants partagés métier
    dashboard/           # composants spécifiques dashboard
    site/                # composants sites publics artisans
  lib/
    auth/                # helpers auth + tenant
    db/                  # client Drizzle + helpers
    email/               # templates Resend/React Email
    ai/                  # helpers Anthropic / AI agent
    stripe/              # helpers Stripe
    pdf/                 # génération PDF factures
    validations/         # schemas Zod partagés
  db/
    schema/              # schéma Drizzle (une table = un fichier)
    migrations/          # migrations générées par drizzle-kit
```

### Nommage
- **Composants** : PascalCase (`InvoiceTable.tsx`)
- **Fonctions/hooks** : camelCase (`useInvoices.ts`)
- **Constantes** : SCREAMING_SNAKE_CASE
- **Types/Interfaces** : PascalCase, préfixe `T` pour types complexes
- **Server actions** : suffixe `Action` (`createInvoiceAction.ts`)
- **API routes** : `route.ts` dans le dossier de la route

### TypeScript — règles strictes
- `strict: true` dans tsconfig — aucune exception
- Toujours typer les retours de fonctions async
- Utiliser les types inférés de Drizzle (`InferSelectModel<typeof invoices>`)
- Zod pour toute validation externe (forms, API, env vars)
- Préférer `type` à `interface` sauf pour les contracts publics

### Async/await
- Toujours `async/await`, jamais `.then().catch()`
- Toujours entourer les Server Actions d'un try/catch
- Utiliser `Result<T, E>` pattern pour les erreurs métier (voir `src/lib/result.ts`)

## TDD — non négociable

> **Règle d'or : écrire le test avant d'écrire le code.**

1. Écrire le test qui échoue (RED)
2. Écrire le minimum de code pour qu'il passe (GREEN)
3. Refactorer (REFACTOR)

Voir `.claude/rules/tdd.md` pour les conventions complètes.

## Sécurité — règles absolues

- **JAMAIS** de `supabaseAdmin` dans un composant client ou une route publique
- **JAMAIS** de clé API dans le code (uniquement variables d'environnement)
- **TOUJOURS** valider les inputs avec Zod avant tout traitement
- **TOUJOURS** vérifier le `tenant_id` avant toute opération CRUD
- Voir `.claude/rules/security.md` pour les règles complètes

## Import des fichiers de référence

@package.json
@tsconfig.json
@src/db/schema/index.ts
