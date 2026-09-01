#!/usr/bin/env bash
# Hostinger sunucusunda çalıştırılır — git pull, build, tablo ensure, restart.
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-$HOME/domains/duzceradikal.com/public_html/rdkhaber}"
BRANCH="${DEPLOY_BRANCH:-main}"

echo "==> Deploy path: $DEPLOY_PATH"
cd "$DEPLOY_PATH"

echo "==> Git pull ($BRANCH)"
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

if [[ -f .env.production.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.production.local
  set +a
elif [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL tanımlı değil (.env veya .env.production.local)." >&2
  exit 1
fi

echo "==> npm ci"
# .env içinde NODE_ENV=production olsa bile build için devDependencies gerekli olabilir
npm ci --include=dev

echo "==> npm run build"
npm run build

echo "==> Tablo ensure"
node scripts/ensure-all-tables.mjs

echo "==> Demo seçim (yoksa)"
node scripts/seed-demo-election.mjs

echo "==> ads.txt sync"
node scripts/sync-ads-txt.mjs

if [[ -n "${HOSTINGER_RESTART_CMD:-}" ]]; then
  echo "==> Restart"
  eval "$HOSTINGER_RESTART_CMD"
else
  echo "==> Restart atlandı (HOSTINGER_RESTART_CMD tanımlı değil)"
fi

echo "==> Deploy tamamlandı"
