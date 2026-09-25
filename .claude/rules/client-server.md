# Frontière client / serveur

`src/lib/artisan/site-config.ts` importe `site-data.ts`, qui importe `src/lib/db` (postgres + modules Node). Un **import de valeur** depuis `site-config.ts` (ou tout module qui tire `db`) dans un composant `"use client"` fait échouer `pnpm build` (`Module not found: 'net' / 'tls' / 'fs'`). Les imports de **type** seuls sont sans danger (effacés à la compilation).

`typecheck` passe, **seul le build casse**. Cas rencontré le 2026-09-06 avec `SOCIAL_PLATFORMS` dans `design-editor.tsx`.

**Règle** : toute constante ou fonction partagée entre l'éditeur client et le rendu serveur va dans un module **sans dépendances** (ex. `src/lib/artisan/social.ts`, `templates.ts`), jamais dans `site-config.ts`. Vérifier avec `pnpm build`.
