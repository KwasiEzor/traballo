# Traballo — Audit technique & état des lieux

> Date : 2026-09-03
> Commit analysé : `f2dbd3b` (branche `main`)
> Périmètre : architecture, sécurité multi-tenant, conformité facturation, tests/CI, complétude produit, sortie de Supabase.

---

## 1. Résumé exécutif

**Verdict : socle sérieux, produit encore à ~15 %.**

Traballo est un squelette Next.js 15 / Drizzle / Postgres bien pensé côté **modélisation** et **isolation multi-tenant** (défense en profondeur réelle : filtre applicatif `tenant_id` + RLS Postgres `FORCE` + rôle dédié + contexte par transaction + tests de sécurité exécutables). C'est nettement au-dessus de la moyenne des starters SaaS.

En revanche :

- Les **3 features phares du PRD** (site public éditable, agent IA, RDV + notifications) sont des pages placeholder. `src/app/api/` est **vide** : aucun webhook Stripe, aucun endpoint IA, aucun export RGPD.
- La **numérotation de factures a une race condition** — bloquant pour un produit dont l'argument de vente est la conformité e-facturation 2026/2027.
- Les **PDF sont stockés en base64 dans une colonne `text`** de `invoices`.
- Le discours **TDD** n'est pas tenu : couverture réelle **10,84 %** pour un seuil fixé à 80 % (`pnpm test:coverage` échoue).
- La couche `createTenantClient` (Proxy) est une **abstraction qui fuit** et se cassera au premier besoin de query builder réel.
- **Aucune CI**, `middleware.ts` du repo est une version *antérieure* (résolution domaine custom = `// TODO`), `pnpm db:seed` référence un fichier inexistant.

`pnpm typecheck` ✅ · `pnpm lint` ✅ (mais `next lint` déprécié) · `pnpm test` ✅ (8 passés / 7 skipés) · `pnpm test:coverage` ❌ · `pnpm check:full` ❌.

---

## 2. État des lieux — ce qui tourne / ce qui manque

| Domaine | Statut | Détail |
|---|---|---|
| Schéma DB (12 tables) | ✅ Solide | 1 table/fichier, `tenant_id` + index partout, relations Drizzle propres |
| Migrations | ⚠️ Dérive | `0004`/`0005` écrites à la main, pas de snapshot `meta/` → `drizzle-kit generate` ne pourra plus diff correctement. `0003` vs `0005` incohérents (cf. §4.1) |
| RLS Postgres | ✅ Sérieux | `ENABLE` + `FORCE` sur toutes les tables, policies par opération, rôle `authenticated` |
| Auth (signup/signin) | ⚠️ Fonctionnel mais fragile | Supabase Auth, pas de vérification email imposée, provisioning non atomique inter-systèmes, mdp min 6 |
| Auth admin | ⚠️ Stopgap | Allowlist `ADMIN_EMAILS`, pas d'audit log, pas de MFA, gate uniquement dans le composant page |
| Factures — CRUD | ✅ Basique OK | Création + liste + détail + statut |
| Factures — numérotation | 🔴 Bug | Race condition, pas de contrainte `UNIQUE(tenant_id, invoice_number)`, pas de séquence légale |
| Factures — PDF | 🔴 Anti-pattern | `@react-pdf/renderer` OK, mais stockage `data:` base64 dans `invoices.pdf_url` |
| Factures — envoi email | ✅ OK | Resend + React Email, template présent |
| Factur-X / PEPPOL | ❌ Absent | Rien, alors que c'est l'argument commercial n°1 |
| Clients — CRUD | 🟡 Partiel | Création + liste, pas d'édition/suppression |
| RDV / disponibilités | 🟡 Partiel | Actions présentes, **notifications absentes** |
| Site public artisan | ❌ Placeholder | `sites/[slug]/page.tsx` = `<h1>Site Public</h1>`, `dashboard/site/` **manquant** (mais lien dans la nav) |
| Agent IA | ❌ Absent | `@anthropic-ai/sdk` + `ai` + 3 tables `ai_*`, **zéro code** |
| Domaine custom | ❌ `// TODO` | `middleware.ts` du repo ne résout pas ; `getTenantIdFromHost` cherche `sites.customDomain` mais la réécriture publique attend un `slug` porté par `tenants` |
| Webhooks Stripe | ❌ Absent | SDK + colonnes `stripe_*` + doc de déploiement, mais `src/app/api/` vide |
| Export / suppression RGPD | ❌ Absent | TRB-RGPD-02/03 non couverts |
| Reset mot de passe | ❌ Absent | Lien `/auth/forgot-password` → 404 |
| Landing page | ❌ Placeholder | `<h1>Traballo</h1>` + 2 boutons |
| Dashboard / Admin home | ❌ Placeholder | `<div>` centré |
| Tests | 🔴 Faible | 3 fichiers réels ; sécurité RLS skipée sauf `RUN_DB_SECURITY_TESTS=1` ; couverture 10,84 % vs seuil 80 % |
| CI | ❌ Absent | Pas de `.github/workflows`, rien n'exécute `pnpm check` |
| `next.config.*` | ❌ Absent | Pas de config `images` (logos distants), ni `serverExternalPackages` pour `@react-pdf/renderer` |
| `db:seed` | 🔴 Cassé | Script dans `package.json`, `src/db/seed.ts` inexistant |
| Docs | ✅ Riches mais dérivées | `CLAUDE.md`, `GEMINI.md`, `PRD`, `DEPLOYMENT.md`, `IMPROVEMENT_PLAN.md` — `CLAUDE.md`/`GEMINI.md` affirment que le routage domaine custom et `getTenantDb` sont finis (faux) |

---

## 3. Points forts

1. **Isolation multi-tenant en défense de profondeur.** Peu de projets vont aussi loin : `tenant_id` obligatoire + index, RLS `ENABLE`+`FORCE`, rôle non-bypass `authenticated`, `SET LOCAL app.current_tenant_id` par transaction, et surtout `tests/security/tenant-isolation.test.ts` qui **exécute vraiment** les scénarios d'attaque (lecture/update/delete cross-tenant, bascule de rôle `authenticated`/`service_role`).
2. **Schéma de données propre et cohérent.** Types Drizzle inférés, enums PG, `numeric(10,2)` pour la monnaie (pas de `float`), `on delete` réfléchis (`restrict` sur `invoices.client_id`, `set null` sur `appointments.client_id`).
3. **Outillage ops.** `scripts/audit-rls.ts` (chaque table a un `tenant_id` + `ENABLE RLS`), `scripts/audit-migrations.ts` (`--live` vérifie `drizzle.__drizzle_migrations`). Bonne culture d'infra.
4. **Patterns modernes corrects.** `Result<T,E>` typé, `unstable_rethrow` pour ne pas avaler les `redirect()`/`notFound()` de Next, Zod pour toute entrée externe, Server Actions.
5. **`requireAuth()` unifié** renvoyant `{ userId, tenantId, email, plan, role }` — bonne API.
6. **Stack cohérente et à jour** : Next 15 / React 19 / Tailwind 4 / Drizzle 0.41.
7. **Documentation abondante** : le PRD est détaillé (marché, conformité, pricing, roadmap) et `src/app/api/CLAUDE.md` fixe un contrat de route propre.

---

## 4. Points faibles (avec exemples concrets)

### 4.1 Architecture & correction

**a) `createTenantClient` — abstraction Proxy qui fuit**
`src/lib/db/tenant.ts` enveloppe `db.query` dans un `Proxy` récursif. Problèmes :
- **Une transaction par lecture.** `InvoicesPage` fait `tenantDb.query.invoices.findMany(...)` → chaque appel ouvre une transaction avec `SET LOCAL ROLE` + `SET LOCAL app.current_tenant_id`. Sur Vercel/serverless, c'est 2–3 aller-retours réseau par SELECT.
- **Builders amputés.** `insert().values().returning()` uniquement — pas de `onConflictDoUpdate`, pas de `where` sur `insert`, pas de `set` partiel chaîné. `generate-pdf.ts` doit d'ailleurs mélanger `createTenantClient` **et** `withTenant` séparés.
- **`any` partout** dans le Proxy → la sécurité de type Drizzle est perdue à l'endroit le plus critique.

> **Reco :** supprimer le Proxy. Garder un seul helper explicite :
> ```ts
> // Une transaction tenant-scoped, réutilisée pour N opérations
> export async function withTenant<T>(tenantId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
>   return db.transaction(async (tx) => {
>     await tx.execute(sql.raw("SET LOCAL ROLE authenticated"));
>     await tx.execute(sql`SET LOCAL app.current_tenant_id = ${tenantId}`);
>     await tx.execute(sql`SET LOCAL app.current_user_id = ${/* userId */ ""}`);
>     return fn(tx);
>   });
> }
> ```
> Les pages lisent via `withTenant(tenantId, tx => tx.query.invoices.findMany(...))`. Une seule transaction, types intacts.

**b) Numérotation de factures — race condition + non-conformité légale**
`src/app/dashboard/invoices/actions/create-invoice.ts` :
```ts
const lastInvoice = await tx.query.invoices.findFirst({ orderBy: desc(createdAt) });
const invoiceNumber = lastInvoice
  ? `INV-${String(parseInt(lastInvoice.invoiceNumber.split("-")[1]) + 1).padStart(4, "0")}`
  : "INV-0001";
```
- Deux requêtes concurrentes → deux `INV-0002`. Aucune contrainte `UNIQUE(tenant_id, invoice_number)` pour rattraper.
- La facturation FR/BE exige une **séquence chronologique continue, sans trou**, par entité et par exercice. Ici : trous possibles (facture annulée), pas de reset annuel, parsing fragile.

> **Reco :** table compteur + `UPSERT` atomique, dans la même transaction que l'insert.
> ```sql
> CREATE TABLE invoice_counters (
>   tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
>   year      int  NOT NULL,
>   next_seq  int  NOT NULL DEFAULT 1,
>   PRIMARY KEY (tenant_id, year)
> );
> ALTER TABLE invoices ADD CONSTRAINT invoices_number_unique UNIQUE (tenant_id, invoice_number);
> ```
> ```ts
> const [{ seq }] = await tx.execute(sql`
>   INSERT INTO invoice_counters (tenant_id, year, next_seq) VALUES (${tenantId}, ${year}, 2)
>   ON CONFLICT (tenant_id, year) DO UPDATE SET next_seq = invoice_counters.next_seq + 1
>   RETURNING invoice_counters.next_seq - 1 AS seq
> `);
> const invoiceNumber = `${year}-${String(seq).padStart(4, "0")}`;
> ```

**c) PDF stocké en base64 dans la DB**
`generate-pdf.ts` : `const dataUrl = 'data:application/pdf;base64,' + buffer.toString('base64')` puis `UPDATE invoices SET pdf_url = dataUrl`.
- Une facture de 120 Ko pèse ~165 Ko **dans la ligne** `invoices`, tirée à chaque `findFirst` du détail.
- Les `data:` URLs ne s'affichent pas dans la majorité des clients mail → le lien « Télécharger PDF » de l'email est mort.
- Bloat de table, cache de pages cassé, sauvegardes plus lourdes.

> **Reco :** générer → uploader vers l'object storage → stocker **la clé**. Email : soit pièce jointe directe (`sendEmail` supporte déjà `attachments`), soit URL signée courte durée.

**d) `middleware.ts` du repo est obsolète**
Version synchrone avec `// TODO: Query DB to resolve custom domain`. `CLAUDE.md` et `GEMINI.md` affirment pourtant que la résolution domaine custom est en place. De plus le rewrite `[slug].traballo.pro → /sites/[slug]` s'appuie sur un `slug` qui vit sur `tenants`, mais `getTenantIdFromHost` va chercher `sites.custom_domain` — deux modèles de résolution qui ne se rejoignent pas.

**e) Politique RLS `users` couplée à Supabase/PostgREST**
`0005_harden_tenant_rls.sql` :
```sql
... OR (id)::text = coalesce((nullif(current_setting('request.jwt.claims', true), ''))::jsonb ->> 'sub'), '')
```
`request.jwt.claims` est une variable **PostgREST/Supabase**. L'app se connecte via Drizzle → cette branche est **toujours vide**. Résultat : `requireAuth()` ne peut lire la ligne `users` que parce qu'il passe par `db` (chemin propriétaire, hors RLS), pas par `withTenant`. Chicken-and-egg fragile.

> **Reco :** remplacer par `current_setting('app.current_user_id', true)` et le poser dans `withTenant`.

**f) Divers**
- `getTenantId()` / résolution par hostname **toujours exportée et aliasée** malgré `IMPROVEMENT_PLAN` P1.2.
- `supabase-admin.ts` fait un `throw` au niveau module si l'env manque, et il est importé par `signup/page.tsx` (une **page**) → couplage build.
- Pas de `next.config.*` : `@react-pdf/renderer` a souvent besoin de `serverExternalPackages: ["@react-pdf/renderer"]`.
- `tailwind.config.ts` pointe `./src/pages/**` (dossier inexistant) — vestige, Tailwind 4 se configure en CSS `@theme`.

### 4.2 Sécurité & auth

1. **Provisioning signup non atomique.** `supabase.auth.signUp()` puis transaction DB `tenants`+`users`. Compensation `deleteUser()` seulement si une erreur est *levée* — un crash process laisse un utilisateur auth orphelin. Pas de vérification email imposée avant l'accès dashboard.
2. **`requireAuth()` = 1 requête DB (join `users`+`tenant`) à chaque rendu**, y compris le layout dashboard. Aucun `React.cache`. `CLAUDE.md` dit « on pourrait cacher dans le JWT » — pas fait.
3. **Admin.** Allowlist env OK en stopgap, mais : pas de journal d'accès, pas de MFA imposée, et `admin.traballo.pro` n'est *pas* gardé par le middleware — seulement par `await requireAdminAccess()` dans chaque page. Un `await` oublié = admin ouvert.
4. **Pas de rate limiting** sur signin/signup (brute force). `DEPLOYMENT.md` mentionne Upstash « à ajouter ».
5. **Mot de passe min 6.** Passer à 10+ et déléguer au provider un check anti-fuite.
6. `DEPLOYMENT.md` versionne le `project_ref` Supabase réel et des clés tronquées → à retirer/roter de toute façon lors de la migration.

### 4.3 Tests & CI

- **Couverture 10,84 %** (fonctions 70 %), seuil 80 % → `pnpm test:coverage`, `pnpm test:ci`, `pnpm check:full` **échouent**.
- 3 fichiers de test réels : `create-invoice` (intégration mockée), `admin`, `tenant-isolation` (**skipé** sauf `RUN_DB_SECURITY_TESTS=1` + DB accessible).
- Zéro test : signup, signin, `withTenant`, middleware, PDF, email, la plupart des actions.
- `next lint` **déprécié** (Next 16 le supprime) ; `.eslintrc.json` en ancien format.
- **Aucun workflow CI.** `pnpm check` existe, rien ne l'exécute. La règle « ne pas committer si les tests échouent » n'est pas outillée.
- `scripts/check-pages.ts` tape les URLs de **production** — ce n'est pas un test, c'est un smoke check prod déguisé.

### 4.4 Complétude produit vs PRD

Le PRD vend un « business pack tout-en-un ». Réalité du code :

| Promesse PRD | Réalité |
|---|---|
| Site web pro à template métier, live en minutes | Page `<h1>Site Public</h1>`, éditeur inexistant |
| Facturation conforme e-facturation 2026/2027 | CRUD basique, **0** ligne Factur-X/PEPPOL, numérotation buggée |
| Agent IA configurable 24/7 | 3 tables, 0 code |
| RDV + notifications automatiques | RDV partiels, **0** notification |
| Bouton WhatsApp flottant + IA | Absent |
| Export données JSON/CSV (RGPD) | Absent |

---

## 5. Sortir de Supabase — recommandation

### 5.1 Ce que Supabase fait aujourd'hui dans le projet

| Usage | Où | Criticité |
|---|---|---|
| Postgres managé | `DATABASE_URL` / `DIRECT_URL` (Drizzle) | Élevée |
| Auth email/password + cookies | `@supabase/ssr`, `@supabase/supabase-js` | Élevée |
| Rôles PG `authenticated` / `service_role` / `anon` | `withTenant`, tests sécurité, policies RLS | Élevée (couplage caché) |
| Storage fichiers | **Prévu, jamais implémenté** (mock MSW only) | Nulle aujourd'hui |
| `request.jwt.claims` dans policy `users` | `0005_harden_tenant_rls.sql` | Faible (branche morte) |

Bonne nouvelle : le produit **n'est pas lancé** → **aucune donnée utilisateur à migrer**. On recrée, on ne migre pas.

### 5.2 Stack de remplacement recommandée

| Besoin | Remplacement | Pourquoi celui-là |
|---|---|---|
| **Base de données** | **Neon** (région `eu-central-1` Francfort) | Postgres pur, serverless, scale-to-zero, **branching** = 1 DB isolée par preview Vercel, free tier large, intégration Vercel Marketplace native. **Drizzle inchangé** : on ne touche qu'aux chaînes de connexion. Conforme RGPD (données EU). |
| **Auth** | **Better Auth** (tables dans **ton** Neon, adapter Drizzle) | Toute la PII reste dans ta DB EU → **supprime Supabase comme sous-traitant RGPD**. Couvre tout le PRD : email/password, magic link, OAuth Google, 2FA (plugin). Natif App Router (`toNextJsHandler`). Open-source, pas de MAU facturés. |
| **Storage** | **Vercel Blob** (MVP) → **Scaleway Object Storage** ou **Cloudflare R2 (juridiction EU)** si résidence stricte exigée | Rien à migrer. S3-compatible → `@aws-sdk/client-s3`, swappable en 1 fichier. |
| **Rôles RLS** | Migration SQL `CREATE ROLE` explicite (cf. 5.4) | Neon ne pré-crée pas `authenticated`/`service_role`. |
| **MCP** | Remplacer `.mcp.json` Supabase par le MCP **Neon** (+ Vercel) | — |

**Alternative auth managée : Clerk.** Intégration Vercel Marketplace en 1 clic, DX excellente, composants prêts. Contreparties : sous-traitant **US** (DPA existe, résidence EU seulement sur offre entreprise), coût au-delà du free tier, et la PII sort de ta DB — ce qui complique l'histoire RGPD que le PRD met en avant. À choisir seulement si tu veux minimiser le travail auth et acceptes le compromis.

> **Recommandation ferme : Neon + Better Auth + Vercel Blob.** Cohérent avec la philosophie déjà présente dans le code (« la RLS est le dernier garde-fou, possède ta DB »).

### 5.3 Migration DB (Neon) — étapes

1. Créer un projet Neon région Francfort. Récupérer les 2 URLs : *pooled* (`...-pooler...`) et *direct*.
2. `drizzle.config.ts` : `dbCredentials.url` = URL **directe** (inchangé, juste la valeur).
3. `src/lib/db/index.ts` : garder le driver `postgres` (les transactions de `withTenant` en ont besoin ; `drizzle-orm/neon-http` ne supporte pas les transactions). Utiliser l'URL **pooled**. Option perf : passer à `drizzle-orm/neon-serverless` (WebSocket, transactions OK).
4. `.env` : `DATABASE_URL` = pooled, `DIRECT_URL` = directe. Supprimer les `NEXT_PUBLIC_SUPABASE_*` et `SUPABASE_SERVICE_ROLE_KEY`.
5. `pnpm db:migrate` sur la nouvelle base.
6. Écrire `src/db/seed.ts` (manquant) pour les données de dev.
7. Régénérer les snapshots `meta/` : refaire `0004`/`0005` via `drizzle-kit generate` (SQL custom encapsulé) pour restaurer le diff.

### 5.4 Rôles & RLS — la vraie subtilité

Supabase fournit `authenticated` (non-bypass) et `service_role` (**`BYPASSRLS`**). Sur Neon il faut les créer. Migration `0006_bootstrap_roles.sql` :

```sql
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN BYPASSRLS;  -- Neon: via le rôle neon_superuser
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- le rôle de login de l'app doit pouvoir SET ROLE authenticated
GRANT authenticated, service_role TO CURRENT_USER;
```

Si Neon refuse `BYPASSRLS` (pas superuser sur ton plan) : deux options —
- créer `service_role` **via l'API/console Neon** avec l'attribut bypass ;
- ou ajouter des policies permissives `... TO service_role USING (true) WITH CHECK (true)` sur chaque table (les tests `service_role can still read cross-tenant` passeront ainsi).

Puis, dans `0005`, remplacer la branche `request.jwt.claims` de la policy `users` par :
```sql
OR (id)::text = current_setting('app.current_user_id', true)
```
et faire poser `app.current_user_id` par `withTenant`.

### 5.5 Migration Auth (Better Auth) — étapes

1. `pnpm remove @supabase/ssr @supabase/supabase-js && pnpm add better-auth`
2. `src/lib/auth/better-auth.ts` :
   ```ts
   import { betterAuth } from "better-auth";
   import { drizzleAdapter } from "better-auth/adapters/drizzle";
   import { magicLink, twoFactor } from "better-auth/plugins";
   import { db } from "@/lib/db";

   export const auth = betterAuth({
     database: drizzleAdapter(db, { provider: "pg" }),
     emailAndPassword: { enabled: true, minPasswordLength: 10, requireEmailVerification: true },
     socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! } },
     plugins: [magicLink({ sendMagicLink: async ({ email, url }) => { /* Resend */ } }), twoFactor()],
   });
   ```
3. Route : `src/app/api/auth/[...all]/route.ts` → `export const { GET, POST } = toNextJsHandler(auth)`.
4. Better Auth gère ses tables `user` / `session` / `account` / `verification`. **Garder la table applicative `users`** comme table d'appartenance tenant (`tenantId`, `role`), FK vers `user.id`. Ajouter la génération de ces tables au schéma Drizzle (`npx @better-auth/cli generate`).
5. Réécrire `src/lib/auth/supabase-server.ts` → `src/lib/auth/session.ts` :
   ```ts
   export async function getCurrentUser() {
     const s = await auth.api.getSession({ headers: await headers() });
     return s?.user ?? null;
   }
   ```
   `require-auth.ts`, `admin.ts` : ne changent que l'import. `index.ts` : idem.
6. `signup/page.tsx` : `auth.api.signUpEmail(...)` puis, dans la foulée, création `tenants` + `users` avec compensation propre (supprimer l'utilisateur BA si le provisioning échoue).
7. Supprimer `supabase-admin.ts`. Les opérations « admin/bypass » passent par `db` (rôle propriétaire) ou une connexion `service_role` dédiée.
8. `middleware.ts` : la protection de session se fait via cookie Better Auth (`getSessionCookie(request)` — check léger, sans DB).
9. `tests/setup.ts` : remplacer les mocks `@/lib/auth/supabase-server` par des mocks `@/lib/auth/session`.

### 5.6 Storage — à construire (rien à migrer)

```ts
// src/lib/storage/index.ts  — Vercel Blob
import { put } from "@vercel/blob";
export async function uploadInvoicePdf(tenantId: string, invoiceId: string, pdf: Buffer) {
  const { url } = await put(`t/${tenantId}/invoices/${invoiceId}.pdf`, pdf, {
    access: "private", contentType: "application/pdf",
  });
  return url; // → invoices.pdf_url
}
```
`generate-pdf.ts` : `renderToBuffer` → `uploadInvoicePdf` → `UPDATE invoices SET pdf_url = url`. Email : pièce jointe directe via `sendEmail({ attachments: [{ filename, content: pdf }] })`.

### 5.7 Effort estimé

| Lot | Charge |
|---|---|
| DB → Neon (connexions, env, migrate, seed, snapshots) | 0,5 j |
| Rôles + RLS `app.current_user_id` | 0,5 j |
| Auth → Better Auth (lib, route, schéma, signup/signin, admin, tests) | 2–3 j |
| Storage (lib + branchement PDF) | 0,5 j |
| Nettoyage (`.mcp.json`, `DEPLOYMENT.md`, `CLAUDE.md`/`GEMINI.md`, deps) | 0,5 j |
| **Total** | **~4–5 j** |

---

## 6. Roadmap priorisée

### P0 — Débloquer (avant toute nouvelle feature)
1. **Sortie Supabase** → Neon + Better Auth + Blob (§5).
2. **CI** : workflow GitHub Actions qui lance `pnpm check` (typecheck + lint + test) sur chaque PR.
3. **Numérotation factures** : table compteur + `UNIQUE(tenant_id, invoice_number)` (§4.1.b).
4. **PDF hors DB** (§4.1.c).
5. Réparer : `middleware.ts` (résolution domaine custom + garde admin), `db:seed`, migrations `0003`/`0005` cohérentes + snapshots `meta/`.
6. Migrer `next lint` → ESLint CLD (`npx @next/codemod next-lint-to-eslint-cli .`).

### P1 — Fondations produit
7. Supprimer le Proxy `createTenantClient`, tout passer par `withTenant` (§4.1.a).
8. `requireAuth()` mis en cache par requête (`React.cache`).
9. Rate limiting signin/signup + vérification email imposée + mdp ≥ 10.
10. Édition/suppression clients ; notifications RDV (email d'abord).
11. Export RGPD (JSON/CSV) + suppression de compte.
12. Webhook Stripe (`/api/webhooks/stripe`) + cycle d'abonnement.
13. Baisser le seuil de couverture à un chiffre honnête (ex. 40 %) **puis** le remonter au fur et à mesure ; écrire les tests signup/`withTenant`/middleware.

### P2 — Différenciateurs
14. Éditeur de site public + rendu `sites/[slug]` réel.
15. Agent IA (endpoint streaming + `ai_*`).
16. Factur-X / PEPPOL (le cœur de l'argumentaire — prévoir un lot dédié).
17. Landing page réelle.
18. Observabilité (Sentry) + `next.config` (`images`, `serverExternalPackages`).

---

## 7. Nettoyages rapides (< 1 h chacun)

- `tailwind.config.ts` : retirer `./src/pages/**` ou supprimer le fichier (Tailwind 4).
- `CLAUDE.md` / `GEMINI.md` : corriger les affirmations fausses (domaine custom, `getTenantDb`).
- `DEPLOYMENT.md` : retirer `project_ref` et clés ; réécrire pour Neon/Better Auth.
- `scripts/check-pages.ts` : cibler `localhost` ou un déploiement preview, pas la prod.
- `.mcp.json` : Supabase → Neon.
- Supprimer `supabase:*` de `package.json` (`scripts`).
