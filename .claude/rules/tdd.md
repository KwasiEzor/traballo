# TDD

Le test s'écrit **avant** le code.

1. RED : écrire le test, le voir échouer pour la bonne raison.
2. GREEN : le minimum de code pour le faire passer.
3. REFACTOR : nettoyer, tests toujours verts.

- Tests unitaires et d'intégration : `pnpm test` (vitest). E2E : `pnpm test:e2e` (playwright).
- Isolation des tenants : `RUN_DB_SECURITY_TESTS=1 pnpm test:security` (tests dans `tests/security/`).
- Avant de committer : `pnpm check` (audit migrations, typecheck, lint, tests). Avant une release : `pnpm check:full`.
- Ne pas committer du code qui ne compile pas ni des tests qui échouent.
- Rendu HTML des emails (react SSR) : le helper de test retire les marqueurs `<!-- -->` et décode `&`.
