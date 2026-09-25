#!/usr/bin/env bash
# PreToolUse(Edit|Write|NotebookEdit) — protège les secrets et les migrations déjà versionnées.
set -uo pipefail

path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // ""')
[ -z "$path" ] && exit 0
base=$(basename "$path")

deny() {
  echo "Bloqué par .claude/hooks/guard-files.sh : $1" >&2
  echo "Fichier : $path" >&2
  exit 2
}

# Fichiers d'environnement (secrets). .env.example reste éditable.
case "$base" in
  .env.example) ;;
  .env|.env.*) deny "fichier d'environnement (secrets) : à modifier par l'utilisateur, jamais par l'agent." ;;
esac

# Migrations déjà suivies par git : immuables. Les nouvelles (générées par drizzle-kit) passent.
case "$path" in
  */src/db/migrations/*)
    dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
    if git -C "$dir" ls-files --error-unmatch "$path" >/dev/null 2>&1; then
      deny "migration déjà versionnée : ne jamais l'éditer. Créer une nouvelle migration (pnpm db:generate)."
    fi
    ;;
esac

exit 0
