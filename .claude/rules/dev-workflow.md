# Workflow de développement — pièges constatés

- **Ne jamais lancer `pnpm typecheck` ou `pnpm build` pendant que `pnpm dev` tourne** : les deux écrivent dans `.next` et le corrompent. Arrêter le serveur d'abord.
- **Vérifier avec `pnpm build`, pas seulement `typecheck`** : certaines erreurs (imports client/serveur) ne cassent que le build. Voir `client-server.md`.
- Resend rejette les destinataires en `.test` (pas un bug). Utiliser une vraie adresse pour les essais.
- Carte Leaflet : `fadeAnimation={false}` est **obligatoire** sur `MapContainer` (sinon tuiles à `opacity:0`, carte grise quand elle monte dans un conteneur révélé au scroll). Garder `<ResizeOnMount>`.
- Tuiles Stadia : authentification **par domaine**. `localhost` marche d'office ; en prod `traballo.pro` et `*.traballo.pro` doivent être allow-listés chez Stadia, sinon définir `NEXT_PUBLIC_STADIA_MAPS_API_KEY`.
- CLI Vercel : version ≥ 53 requise (`env add` par stdin est sans effet avant). Les suppressions de stores Blob et `env rm` isolés passent par un script committé ou par l'utilisateur.
- Après chaque `vercel deploy` de preview : `vercel alias set <url> traballo-preview.vercel.app`.
- Variables d'environnement : les pousser avec `scripts/vercel-env-sync.sh <APP_URL> <environnements...>`.

## Hooks (`.claude/settings.json` → `.claude/hooks/`)

Filet déterministe, indépendant de la vigilance du modèle :

- `guard-bash.sh` (PreToolUse Bash) — **refuse** : force-push, `reset --hard`, `clean -f`, le drapeau `--no-verify`, `rm -r` sur `/` `~` `.` `*`, `db:push`, `DROP`/`TRUNCATE`. **Demande confirmation** : `db:migrate` (base Neon partagée dev/prod), déploiement/rollback prod, suppression de ressources Vercel, `git push`.
- `guard-files.sh` (PreToolUse Edit/Write) — refuse `.env*` (sauf `.env.example`) et l'édition des migrations déjà suivies par git. Une correction = une **nouvelle** migration.
- `typecheck-stop.sh` (Stop) — `tsc --noEmit` en fin de tour si des `.ts/.tsx` ont changé ; l'erreur revient au modèle. Saute si `pnpm dev` tourne. Garde anti-boucle via `stop_hook_active`.

Après toute modification d'un hook : `bash .claude/hooks/test-hooks.sh` (38 cas).

**Limite connue** : `guard-bash.sh` filtre le *texte* de la commande. Une chaîne dangereuse citée dans un heredoc ou un message de commit la bloque à tort (constaté le 2026-09-25 en documentant les hooks). Contournement : écrire le texte avec l'outil d'édition de fichiers, ou reformuler.
