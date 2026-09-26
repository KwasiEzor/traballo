# Base de données — pièges constatés

- `SET LOCAL x = $1` est **invalide** en Postgres. Utiliser `SELECT set_config('app.current_tenant_id', $1, true)` (déjà fait dans `withTenant`).
- Le builder relationnel `db.query.*` **se bloque** à travers le pooler transactionnel de Neon. Utiliser `db.select()` (core) ou du `sql` brut.
- Paramètres liés d'un `sql` brut : **chaînes ISO, jamais des `Date`** (postgres-js avec `prepare:false` lève sinon). Voir `daysAgoIso()` dans `src/lib/admin/metrics.ts`.
- `drizzle-kit migrate` peut **avaler les erreurs**. Après toute migration : `pnpm db:audit:live` doit passer. Ne pas se fier au seul code de sortie.
- Les migrations 0000-0005 ont été enregistrées dans `drizzle.__drizzle_migrations` par une synchro manuelle (appliquées instruction par instruction). Les suivantes passent par `pnpm db:migrate` standard.
- `neondb_owner` a `BYPASSRLS` : `db` ignore la RLS. Toute requête tenant passe par `withTenant()` **et** filtre `tenant_id`.
- Une migration qui ajoute une colonne lue par `resolvePublicSite` doit être appliquée **avant** le déploiement, sinon tous les sites publics renvoient 500 (cas de 0011).
- **Heures saisies par l'artisan = heure de Paris** (FR / BE / LU, CET/CEST). Côté serveur (UTC sur Vercel), ne jamais faire `new Date("YYYY-MM-DDTHH:MM")` : utiliser `parisWallTime` / `parisDate` / `parisDayBounds` (`src/lib/time.ts`). Les colonnes `timestamp` stockent des instants UTC ; `formatDate` les affiche à Paris. Une colonne `date` (`YYYY-MM-DD`) est un jour calendaire, sans fuseau.
