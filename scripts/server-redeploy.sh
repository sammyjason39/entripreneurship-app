#!/usr/bin/env bash
# Run on the VPS from the app directory after updating .env
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/entripreneurship-app}"
cd "$APP_DIR"

echo "==> git pull"
git stash push -m "deploy-$(date +%s)" public/sw.js 2>/dev/null || true
git pull origin main

echo "==> npm ci && build"
npm ci
npm run build

echo "==> pm2 restart"
if [ -f ecosystem.config.cjs ]; then
  pm2 delete entrip 2>/dev/null || true
  pm2 start ecosystem.config.cjs
else
  PORT=3002 pm2 restart entrip || PORT=3002 pm2 start npm --name entrip -- start
fi
pm2 save

echo "==> health"
curl -sS -o /dev/null -w "login HTTP %{http_code}\n" http://127.0.0.1:3002/auth/login
curl -sS http://127.0.0.1:3002/api/auth/whatsapp/waha | head -c 200
echo ""
echo "Done."
