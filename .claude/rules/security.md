# Sécurité — règles absolues

- **Isolation** : toute donnée tenant passe par `withTenant(tenantId, …)` / `getTenantDb()` (`src/lib/db/tenant.ts`) **et** filtre `tenant_id`. La RLS est le dernier garde-fou, pas le seul.
- `db` (propriétaire Neon, bypass RLS) : réservé au bootstrap auth, migrations, scripts et écritures système (ex. `createNotification`). **Jamais** dans un composant client ni une route publique sans filtre tenant explicite.
- **Validation** : Zod avant tout traitement (formulaires, API, variables d'environnement).
- **Secrets** : uniquement en variables d'environnement, jamais dans le code ni dans un fichier committé.
- **`tenant_id`** vérifié avant toute opération CRUD.
- **Endpoints publics** (`submitLead`, `POST /api/agent*`, `/api/marketing-chat*`) : rate limit + Turnstile + honeypot + plafond de leads. Ne pas en ajouter sans ces couches. Voir `docs/SECURITY_FORMS.md`.
- **Admin** : `requireAdminAccess()` (allowlist `ADMIN_EMAILS`) ; toute action admin est écrite dans `admin_audit_log` via `logAdminAction`.
- **Webhooks** : vérifier la signature avant de lire le corps (Stripe).
- Ne jamais renvoyer au client un message d'erreur qui révèle le schéma ou l'existence d'un autre tenant.
