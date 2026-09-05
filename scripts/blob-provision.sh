#!/usr/bin/env bash
#
# scripts/blob-provision.sh
# One-shot: clear stale Vercel Blob env vars, then create + connect a fresh
# PUBLIC Blob store for the artisan site images (logo, hero, gallery).
#
# Public access is mandatory — the images are served on public artisan sites;
# a private store means slow delivery and high egress (per Vercel's docs).
#
# Usage: ./scripts/blob-provision.sh [store-name] [region]

set -euo pipefail

NAME="${1:-traballo-media}"
REGION="${2:-cdg1}"

[[ -f ".vercel/project.json" ]] || { echo "error: project not linked." >&2; exit 1; }

echo "== Clearing stale BLOB_* env vars =="
for k in BLOB_READ_WRITE_TOKEN BLOB_STORE_ID BLOB_WEBHOOK_PUBLIC_KEY; do
  for env in production preview development; do
    vercel env rm "$k" "$env" -y >/dev/null 2>&1 || true
  done
  echo "  rm  $k"
done

echo
echo "== Creating + connecting public Blob store: $NAME ($REGION) =="
vercel blob create-store "$NAME" --access public --region "$REGION" --yes

echo
echo "Now run:  vercel env pull .env.local --yes"
echo "Then:     vercel deploy --prod"
