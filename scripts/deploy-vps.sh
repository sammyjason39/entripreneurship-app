#!/usr/bin/env bash
# Run on Ubuntu VPS after git pull (see DEPLOY.md).
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/entripreneurship-app}"
PM2_NAME="${PM2_NAME:-entrip}"
# Port 3000/80 are used by Docker on this VPS; app runs on 3002.
APP_PORT="${APP_PORT:-3002}"

cd "$APP_DIR"
git pull origin main
npm ci
npm run build
pm2 delete "$PM2_NAME" 2>/dev/null || true
PORT="$APP_PORT" pm2 start npm --name "$PM2_NAME" -- start
pm2 save
echo "Deployed $(git rev-parse --short HEAD)"
