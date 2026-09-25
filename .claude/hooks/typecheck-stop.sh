#!/usr/bin/env bash
# Stop — typecheck une fois en fin de tour si des .ts/.tsx ont changé.
# Saute si `pnpm dev` tourne (typegen/build corrompent .next). Renvoie l'erreur au modèle (exit 2).
set -uo pipefail

input=$(cat)
[ "$(echo "$input" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0

dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$dir" || exit 0

pgrep -f "next dev" >/dev/null 2>&1 && exit 0

git status --porcelain 2>/dev/null | grep -Eq '\.(ts|tsx)$' || exit 0

out=$(npx --no-install tsc --noEmit 2>&1)
if [ $? -ne 0 ]; then
  echo "Typecheck en échec (tsc --noEmit). Corriger avant de terminer :" >&2
  echo "$out" | head -40 >&2
  exit 2
fi
exit 0
