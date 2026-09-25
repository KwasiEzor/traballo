---
name: resume
description: Reprendre le projet Traballo en début de session. Lit docs/STATE.md, vérifie l'état réel (git, migrations, tests), signale tout écart, puis propose la prochaine action sans coder. À utiliser quand l'utilisateur dit "reprends", "on continue", "où en est-on" ou ouvre une nouvelle session sur le projet.
---

# resume — reprise de session

Objectif : partir de l'état **réel**, pas de l'état supposé. `docs/STATE.md` est une hypothèse datée. Ne modifie aucun fichier dans ce skill.

## Étapes

1. **Lire** `docs/STATE.md`, puis le plan lié à l'objectif en cours (ex. `NOTIFICATIONS_PLAN.md`) et `docs/DECISIONS.md` si une décision est en jeu.
2. **Mesurer la réalité** (en parallèle) :
   - `git status --short` et `git log --oneline -15`
   - `git log -1 --format=%cd` : comparer avec la date « Dernière vérification » de `STATE.md`
   - `pnpm db:audit:migrations` (hors ligne), et `pnpm db:audit:live` (lecture seule) si `STATE.md` parle de migrations
   - `pnpm typecheck` et `pnpm test`, **sauf si `pnpm dev` tourne** (`pgrep -fl "next dev"`) : ils corrompent `.next`. Dans ce cas, demander d'arrêter le serveur ou sauter ces deux commandes en le disant.
3. **Comparer** chaque affirmation vérifiable de `STATE.md` à la mesure : commits cités présents ? working tree propre ? migrations appliquées ? tests verts ? Des commits plus récents que `STATE.md` (travail fait hors rituel) ?
4. **Rapporter**, dans cet ordre :
   - **Écarts** entre `STATE.md` et la réalité (en premier, même s'il n'y en a pas : écrire « aucun écart »).
   - **État** : branche, dernier commit, tests/typecheck/lint (verts ou rouges, avec la sortie exacte si rouge).
   - **Prochaine action** telle qu'écrite dans `STATE.md`, corrigée des écarts.
5. **Attendre le feu vert** avant de coder. Si des écarts existent, proposer la correction de `STATE.md` d'abord.

## Règles

- Une mémoire ou un état qui cite un fichier, une fonction ou un commit se **vérifie** (grep, git) avant de s'en servir.
- Si la vérification est impossible (dashboard externe, secret manquant), écrire « non vérifié », jamais « ok ».
- Ne pas lancer de migration, de déploiement ni de commande qui écrit en base. `db:audit:live` lit seulement.
- Sortie courte : écarts, état, prochaine action. Pas de résumé de l'historique.
