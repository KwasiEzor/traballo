#!/usr/bin/env bash
H="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; export CLAUDE_PROJECT_DIR="$(cd "$H/../.." && pwd)"
pass=0; fail=0

bash_case() { # expected(deny|ask|allow) command
  local exp="$1" cmd="$2" out code res
  out=$(jq -n --arg c "$cmd" '{tool_input:{command:$c}}' | "$H/guard-bash.sh" 2>&1); code=$?
  if [ $code -eq 2 ]; then res=deny
  elif echo "$out" | grep -q '"permissionDecision":"ask"'; then res=ask
  else res=allow; fi
  if [ "$res" = "$exp" ]; then pass=$((pass+1)); else fail=$((fail+1)); echo "FAIL bash [$exp≠$res] $cmd"; fi
}
file_case() { # expected(deny|allow) path
  local exp="$1" p="$2" code res
  jq -n --arg p "$p" '{tool_input:{file_path:$p}}' | "$H/guard-files.sh" >/dev/null 2>&1; code=$?
  [ $code -eq 2 ] && res=deny || res=allow
  if [ "$res" = "$exp" ]; then pass=$((pass+1)); else fail=$((fail+1)); echo "FAIL file [$exp≠$res] $p"; fi
}

# deny
bash_case deny "git push --force origin main"
bash_case deny "git push -f"
bash_case deny "git reset --hard HEAD~1"
bash_case deny "git clean -fd"
bash_case deny "git commit --no-verify -m x"
bash_case deny "rm -rf /"
bash_case deny "rm -rf ~"
bash_case deny "rm -rf ."
bash_case deny "rm -rf *"
bash_case deny "pnpm db:push"
bash_case deny "npx drizzle-kit push"
bash_case deny "psql -c 'DROP TABLE invoices'"
bash_case deny "psql -c 'truncate table clients'"
# ask
bash_case ask "pnpm db:migrate"
bash_case ask "vercel deploy --prod"
bash_case ask "vercel env rm FOO production"
bash_case ask "git push origin main"
bash_case ask "git push"
# allow (faux positifs à éviter)
bash_case allow "rm -rf node_modules"
bash_case allow "rm -rf ./.next"
bash_case allow "pnpm test"
bash_case allow "pnpm db:audit:live"
bash_case allow "pnpm db:generate"
bash_case allow "git status"
bash_case allow "git log --oneline -5"
bash_case allow "git commit -m 'feat: ajoute la cloche'"
bash_case allow "git pull --ff-only"
bash_case allow "vercel deploy"
bash_case allow "ls -la"

file_case deny "$CLAUDE_PROJECT_DIR/.env.local"
file_case deny "$CLAUDE_PROJECT_DIR/.env"
file_case deny "$CLAUDE_PROJECT_DIR/.env.production"
file_case allow "$CLAUDE_PROJECT_DIR/.env.example"
file_case deny "$CLAUDE_PROJECT_DIR/src/db/migrations/0010_short_brood.sql"
file_case deny "$CLAUDE_PROJECT_DIR/src/db/migrations/meta/_journal.json"
file_case allow "$CLAUDE_PROJECT_DIR/src/db/migrations/0099_new_untracked.sql"
file_case allow "$CLAUDE_PROJECT_DIR/src/lib/utils.ts"
file_case allow "$CLAUDE_PROJECT_DIR/docs/STATE.md"

echo "pass=$pass fail=$fail"
