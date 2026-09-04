#!/usr/bin/env bash
#
# scripts/vercel-env-sync.sh
# Sync the Neon + Better Auth environment variables from .env.local to Vercel,
# and remove the obsolete Supabase-era variables.
#
# Usage:
#   ./scripts/vercel-env-sync.sh <APP_URL> [environments...]
#
#   APP_URL        Full https URL the deployment answers on. Used for
#                  BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL.
#                  e.g. https://traballo-xxxxxx-kwasiezors-projects.vercel.app
#                       or https://app.traballo.pro
#   environments   One or more of: preview production development
#                  (default: "preview production")
#
# Requirements: vercel CLI logged in, project linked (.vercel/project.json),
#               a populated .env.local in the current directory.
#
# Safe to re-run: each variable is removed then re-added.

set -euo pipefail

APP_URL="${1:-}"
if [[ -z "$APP_URL" ]]; then
  echo "error: pass the deployment URL as the first argument." >&2
  echo "  ./scripts/vercel-env-sync.sh https://your-deployment.vercel.app [preview production]" >&2
  exit 1
fi
shift || true
ENVIRONMENTS=("${@:-preview production}")
# normalise: allow "preview production" as one arg or several
ENVIRONMENTS=($(printf '%s\n' "${ENVIRONMENTS[@]}"))

ENV_FILE=".env.local"
[[ -f "$ENV_FILE" ]] || { echo "error: $ENV_FILE not found." >&2; exit 1; }
[[ -f ".vercel/project.json" ]] || { echo "error: project not linked. Run 'vercel link' first." >&2; exit 1; }

# Read a KEY=value from .env.local, stripping optional surrounding quotes.
getv() {
  local line
  line="$(grep -E "^$1=" "$ENV_FILE" | head -n1 || true)"
  [[ -n "$line" ]] || return 1
  line="${line#"$1"=}"
  line="${line%\"}"; line="${line#\"}"
  line="${line%\'}"; line="${line#\'}"
  printf '%s' "$line"
}

set_var() {  # set_var NAME VALUE
  local name="$1" value="$2" env rc
  if [[ -z "$value" ]]; then
    echo "  skip  $name (no value)"
    return
  fi
  for env in "${ENVIRONMENTS[@]}"; do
    vercel env rm "$name" "$env" -y >/dev/null 2>&1 || true
    # CLI >=52 non-interactive form: --value + --yes (preview => all branches)
    if vercel env add "$name" "$env" --value "$value" --yes >/dev/null 2>&1; then
      :
    else
      rc=$?
      echo "  FAIL  $name ($env) — vercel env add exited $rc" >&2
      return 1
    fi
  done
  echo "  set   $name -> ${ENVIRONMENTS[*]}"
}

remove_var() {  # remove_var NAME
  local name="$1" env
  for env in preview production development; do
    vercel env rm "$name" "$env" -y >/dev/null 2>&1 || true
  done
  echo "  rm    $name (all environments)"
}

echo "Target environments: ${ENVIRONMENTS[*]}"
echo
echo "== Removing obsolete Supabase variables =="
for k in \
  NEXT_PUBLIC_SUPABASE_URL \
  NEXT_PUBLIC_SUPABASE_ANON_KEY \
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY \
  SUPABASE_SERVICE_ROLE_KEY \
  SUPABASE_PASSWORD
do
  remove_var "$k"
done

echo
echo "== Syncing variables from .env.local =="
# copied verbatim from .env.local
for k in \
  DATABASE_URL \
  DATABASE_URL_UNPOOLED \
  BETTER_AUTH_SECRET \
  NEXT_PUBLIC_ROOT_DOMAIN \
  GOOGLE_CLIENT_ID \
  GOOGLE_CLIENT_SECRET \
  RESEND_API_KEY \
  ADMIN_EMAILS \
  EMAIL_FROM
do
  set_var "$k" "$(getv "$k" || true)"
done

# drizzle-kit / scripts fallback name — mirror the unpooled URL
set_var "DIRECT_URL" "$(getv DATABASE_URL_UNPOOLED || true)"

echo
echo "== Deployment URL variables =="
set_var "BETTER_AUTH_URL" "$APP_URL"
set_var "NEXT_PUBLIC_APP_URL" "$APP_URL"

echo
echo "Done. Verify with:  vercel env ls preview"
echo "Then redeploy:      vercel deploy        (preview)"
echo "                    vercel deploy --prod (production)"
echo
echo "Reminder: add  ${APP_URL}/api/auth/callback/google"
echo "to the Google Cloud OAuth client's authorized redirect URIs."
