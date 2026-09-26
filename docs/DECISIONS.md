# DECISIONS — journal des décisions non évidentes

Format : décision · pourquoi · conséquence. Une entrée par décision. Ne pas réécrire l'histoire : ajouter une nouvelle entrée qui remplace l'ancienne.

## 2026-09-03 — Supabase → Neon Postgres + Better Auth

- **Pourquoi** : Better Auth auto-hébergé dans la même base que l'app (tables `user/session/account/verification`), moins de dépendances externes.
- **Conséquence** : `users.id` passe en `text` (FK vers `user.id`). Le rôle `neondb_owner` a `BYPASSRLS` : l'export `db` contourne la RLS. `authenticated` est le rôle non-bypass utilisé par `withTenant()`.
- **RGPD** : la base de prod doit être en `eu-central-1` (Francfort). Le projet dev est en us-east-2.
- **Dépendances imposées** : zod 4, drizzle-orm 0.45, drizzle-kit 0.31, drizzle-zod 0.8, @hookform/resolvers 5.

## 2026-09-03 — Provisioning du tenant dans un hook Better Auth

`ensureTenantForUser()` est appelé depuis `databaseHooks.user.create.after`. Couvre email/mot de passe **et** Google d'un seul point.

## 2026-09-05 — Assistant IA du site vitrine réservé au plan Business

- **Pourquoi** : c'est la fonctionnalité « Agent IA 24h/24 », donc le levier d'upsell, et elle a un coût Anthropic par message.
- **Conséquence** : `resolvePublicSite` et `loadAgentContext` filtrent sur `plan === "business"`. `/dashboard/agent` reste utilisable pour préparer l'agent. `menuiserie-demo` est en `business` via le seed.
- **Quotas** : free 50 / pro 500 / business illimité, par mois. Modèle : Haiku 4.5.

## 2026-09-05 — Clé Anthropic configurable côté admin

Stockée chiffrée (AES-256-GCM, clé dérivée de `BETTER_AUTH_SECRET`) dans `app_settings`, avec repli sur la variable d'environnement.

## 2026-09-05 — Turnstile : échec « ouvert »

La vérification échoue ouverte si le widget est absent ou injoignable, fermée seulement sur rejet explicite. **Pourquoi** : un widget cassé ne doit pas mettre le formulaire de contact hors service. La garantie réelle contre l'abus est le plafond de leads par tenant/jour, pas Turnstile.

## 2026-09-06 — Console admin : impersonation par jeton signé

HMAC (`BETTER_AUTH_SECRET`), 60 min, cookie httpOnly `traballo_imp`. `requireAuth()` le prend en compte. Toute action admin est journalisée dans `admin_audit_log` (RLS deny-all).

## 2026-09-06 — Facturation par Stripe Checkout + portail

État du plan mis à jour de façon **déclarative et idempotente** depuis le webhook (`syncSubscriptionToTenant`), pas de logique impérative par événement.

## 2026-09-07 — Anti-abus en couches sur les endpoints publics

Turnstile + rate limit en mémoire (par instance, best effort) + honeypot + **plafond dur par tenant/jour** (`SITE_LEAD_DAILY_CAP`, défaut 30, les leads au-delà sont écartés silencieusement). **Pourquoi** : borner le pire cas même si les autres couches sont contournées. Détail : `docs/SECURITY_FORMS.md`.

## 2026-09-25 — `main` protégée, CI requise, sans approbation

- **Pourquoi** : du code arrive par plusieurs canaux (sessions locales, sessions Claude web). La CI n'a de valeur que si elle bloque. `enforce_admins` activé, sinon les pushes faits avec le compte admin la contourneraient.
- **Sans approbation** (0 review) : développeur solo, une review obligatoire bloquerait sans rien apporter.
- **Non strict** (branche pas forcément à jour avec `main`) : moins de friction ; à durcir si des merges verts cassent `main`.

## 2026-09-25 — Mémoire projet : état dans le repo, pas dans `memory/`

- **Pourquoi** : les mémoires « état du projet » périment (contradictions constatées le 2026-09-25 : migration 0010 à la fois « non appliquée » et « appliquée »).
- **Conséquence** : l'état vit dans `docs/STATE.md` (versionné, daté, revérifié). `memory/` ne garde que préférences, leçons et références externes.

## 2026-09-26 — Phase 1 des notifications coupée en 1a / 1b

- **1a** (cloche, page, marquer lu) livrée seule : aucune migration, donc aucun risque sur la base partagée dev/prod.
- **1b** (préférences) à part : elle exige une nouvelle table `notification_prefs` (absente de la migration 0010 malgré le plan) et une migration sur la base partagée.
- **Rafraîchissement** de la cloche : `router.refresh()` toutes les 60 s, seulement si l'onglet est visible. Pas de websocket à cette échelle.
- **`actionUrl`** limité aux chemins internes (`safeActionUrl`) : il est rendu comme lien, un `javascript:` ou `//hôte` serait une faille.
- Les requêtes du fil prennent la transaction en paramètre (`readSummary`, `readPage`, `stampRead`) pour être testables contre la vraie base dans une transaction annulée.
