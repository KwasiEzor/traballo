# Workflow de développement — pièges constatés

- **Ne jamais lancer `pnpm typecheck` ou `pnpm build` pendant que `pnpm dev` tourne** : les deux écrivent dans `.next` et le corrompent. Arrêter le serveur d'abord.
- **Vérifier avec `pnpm build`, pas seulement `typecheck`** : certaines erreurs (imports client/serveur) ne cassent que le build. Voir `client-server.md`.
- Resend rejette les destinataires en `.test` (pas un bug). Utiliser une vraie adresse pour les essais.
- Carte Leaflet : `fadeAnimation={false}` est **obligatoire** sur `MapContainer` (sinon tuiles à `opacity:0`, carte grise quand elle monte dans un conteneur révélé au scroll). Garder `<ResizeOnMount>`.
- Tuiles Stadia : authentification **par domaine**. `localhost` marche d'office ; en prod `traballo.pro` et `*.traballo.pro` doivent être allow-listés chez Stadia, sinon définir `NEXT_PUBLIC_STADIA_MAPS_API_KEY`.
- CLI Vercel : version ≥ 53 requise (`env add` par stdin est sans effet avant). Les suppressions de stores Blob et `env rm` isolés passent par un script committé ou par l'utilisateur.
- Après chaque `vercel deploy` de preview : `vercel alias set <url> traballo-preview.vercel.app`.
- **Tester une PR en preview** : on ne peut **pas se connecter** sur l'URL brute du déploiement (`traballo-xxxx-….vercel.app`) : Better Auth refuse l'origine (`trustedOrigins` = `BETTER_AUTH_URL` preview + domaines `traballo.pro`). Pointer l'alias sur la preview de la PR (`vercel alias set <url-preview-PR> traballo-preview.vercel.app`), puis ouvrir `/auth/signin` puis `/dashboard` (sur ce domaine, `/` ne redirige pas vers le dashboard). L'alias n'est pas mis à jour automatiquement : il peut pointer sur un vieux déploiement (constaté : 22 jours de retard le 2026-09-26).
- **Merger sur `main` = déploiement production automatique** (Vercel, ~2 min). Vérifier la PR sur la preview **avant** de merger. Preuve de mise en prod : déploiement GitHub `Production` avec le SHA du merge + `vercel inspect app.traballo.pro`.
- En prod, sans session, `app.traballo.pro` redirige **toute** URL vers la connexion, y compris une route inexistante : un `curl` non connecté ne prouve pas qu'une page existe.
- Le merge des PR est fait par l'utilisateur : le classifieur du mode auto refuse `gh pr merge` (« Merge Without Review »).
- Variables d'environnement : les pousser avec `scripts/vercel-env-sync.sh <APP_URL> <environnements...>`.

## Compte QA (vérifications à l'écran)

Créé le 2026-09-26 pour vérifier l'UI connecté, en local ou sur une preview.

- `qa-claude@traballo.test`, tenant `qa-claude` (plan free, site **non publié**). Mot de passe dans `.qa/account.json` : ignoré par git, local à cette machine. Ne jamais le committer, l'afficher ni le copier ailleurs.
- La base locale **est** la base de prod : le compte existe aussi sur `app.traballo.pro` et sur les previews. Il compte dans les métriques admin (un tenant de plus).
- Adresse en `.test` : Resend refuse l'envoi, **aucun e-mail ne part**. Les parcours qui échouent quand l'e-mail échoue (`submitLead`, lead de l'agent) renvoient donc une erreur. Pour les tester, mettre temporairement une vraie adresse dans Paramètres → Profil (l'e-mail pro reçoit les leads).
- Données de test : rester dans ce tenant. Ne pas publier le site (`qa-claude.traballo.pro` serait public) sans raison, et le dépublier après.
- Recréer (purgé ou mot de passe perdu : pas de reset possible, l'e-mail n'arrive pas) :
  1. inscription sur `localhost:3000/auth/signup` avec les valeurs de `.qa/account.json` (nom d'entreprise `QA Claude` → slug `qa-claude`) ;
  2. `npx tsx --env-file=.env.local scripts/qa-verify-email.ts qa-claude@traballo.test` (refuse toute adresse hors `.test`) ;
  3. connexion, puis onboarding avec des données fictives.

## Hooks (`.claude/settings.json` → `.claude/hooks/`)

Filet déterministe, indépendant de la vigilance du modèle :

- `guard-bash.sh` (PreToolUse Bash) — **refuse** : force-push, `reset --hard`, `clean -f`, le drapeau `--no-verify`, `rm -r` sur `/` `~` `.` `*`, `db:push`, `DROP`/`TRUNCATE`. **Demande confirmation** : `db:migrate` (base Neon partagée dev/prod), déploiement/rollback prod, suppression de ressources Vercel, `git push`.
- `guard-files.sh` (PreToolUse Edit/Write) — refuse `.env*` (sauf `.env.example`) et l'édition des migrations déjà suivies par git. Une correction = une **nouvelle** migration.
- `typecheck-stop.sh` (Stop) — `tsc --noEmit` en fin de tour si des `.ts/.tsx` ont changé ; l'erreur revient au modèle. Saute si `pnpm dev` tourne. Garde anti-boucle via `stop_hook_active`.

Après toute modification d'un hook : `bash .claude/hooks/test-hooks.sh` (38 cas).

**Limite connue** : `guard-bash.sh` filtre le *texte* de la commande. Une chaîne dangereuse citée dans un heredoc ou un message de commit la bloque à tort (constaté le 2026-09-25 en documentant les hooks). Contournement : écrire le texte avec l'outil d'édition de fichiers, ou reformuler.
