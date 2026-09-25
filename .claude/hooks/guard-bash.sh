#!/usr/bin/env bash
# PreToolUse(Bash) — bloque les commandes destructrices, demande confirmation
# pour celles qui touchent la DB partagée (dev = prod), le déploiement ou le remote.
# Filet de sécurité déterministe : ne dépend pas de la vigilance du modèle.
set -uo pipefail

cmd=$(jq -r '.tool_input.command // ""')
[ -z "$cmd" ] && exit 0

deny() {
  echo "Bloqué par .claude/hooks/guard-bash.sh : $1" >&2
  echo "Commande : $cmd" >&2
  exit 2
}

ask() {
  jq -nc --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:$r}}'
  exit 0
}

# --- Refus stricts -----------------------------------------------------------
echo "$cmd" | grep -Eq 'git +push\b.*( --force\b| -f\b| --force-with-lease\b)' \
  && deny "git push --force réécrit l'historique distant."
echo "$cmd" | grep -Eq 'git +reset +--hard' \
  && deny "git reset --hard détruit le travail non committé."
echo "$cmd" | grep -Eq 'git +clean +-[a-zA-Z]*f' \
  && deny "git clean -f supprime des fichiers non suivis."
echo "$cmd" | grep -Eq -- '--no-verify' \
  && deny "--no-verify contourne les vérifications git."
echo "$cmd" | grep -Eq 'rm +-[a-zA-Z]*[rR][a-zA-Z]* +(/|~|\$HOME|\.|\*)( |$)' \
  && deny "rm -r sur la racine, le home, le dossier courant ou un joker."
echo "$cmd" | grep -Eq '(pnpm|npm|npx) +(run +)?(db:push|drizzle-kit +push)|drizzle-kit +push' \
  && deny "drizzle-kit push contourne les migrations versionnées. Utiliser db:generate puis db:migrate."
echo "$cmd" | grep -Eiq 'drop +(table|schema|database)|truncate +(table +)?[a-z"_]' \
  && deny "DROP/TRUNCATE : opération destructrice sur la base (Neon dev = prod ici)."

# --- Confirmation demandée ---------------------------------------------------
echo "$cmd" | grep -Eq '(pnpm|npm) +(run +)?db:migrate|drizzle-kit +migrate' \
  && ask "db:migrate s'applique à la base Neon partagée dev/prod. Lancer 'pnpm db:audit:live' avant et après."
echo "$cmd" | grep -Eq 'vercel( +deploy)?.* --prod|vercel +promote|vercel +rollback' \
  && ask "Déploiement ou promotion en production."
echo "$cmd" | grep -Eq 'vercel +(env +(rm|remove)|blob +delete|remove)' \
  && ask "Suppression de ressource Vercel."
echo "$cmd" | grep -Eq 'git +push\b' \
  && ask "git push publie sur le remote."

exit 0
