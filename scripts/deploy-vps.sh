#!/usr/bin/env bash
# Run on Ubuntu VPS after git pull (see DEPLOY.md).
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/entripreneurship-app}"
PM2_NAME="${PM2_NAME:-entrip}"

cd "$APP_DIR"
git pull origin main
npm ci
npm run build
pm2 restart "$PM2_NAME" || pm2 start npm --name "$PM2_NAME" -- start
pm2 save
echo "Deployed $(git rev-parse --short HEAD)"
