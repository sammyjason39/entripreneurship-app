#!/usr/bin/env bash
# Patch WAHA_* into server .env.local (run ON the VPS, not on your laptop).
# Usage:
#   export WAHA_API_KEY='your-key'
#   bash scripts/patch-waha-env.sh
set -euo pipefail

ENV_FILE="${1:-/var/www/entripreneurship-app/.env.local}"
WAHA_BASE_URL="${WAHA_BASE_URL:-https://waha-uokc3pwxtymt.sgp-wisanggeni.sumopod.my.id}"
WAHA_SESSION="${WAHA_SESSION:-N8N}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  exit 1
fi
if [ -z "${WAHA_API_KEY:-}" ]; then
  echo "Set WAHA_API_KEY first, e.g.: export WAHA_API_KEY='...'"
  exit 1
fi

upsert() {
  local key="$1" val="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i.bak "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
  else
    printf '\n# WAHA WhatsApp\n%s=%s\n' "$key" "$val" >> "$ENV_FILE"
  fi
}

upsert WAHA_BASE_URL "$WAHA_BASE_URL"
upsert WAHA_API_KEY "$WAHA_API_KEY"
upsert WAHA_SESSION "$WAHA_SESSION"

if ! grep -q '^NEXT_PUBLIC_APP_URL=' "$ENV_FILE"; then
  upsert NEXT_PUBLIC_APP_URL "https://entripreneurship.fun"
fi

echo "Updated WAHA vars in $ENV_FILE (backup: ${ENV_FILE}.bak)"
grep -E '^WAHA_|^NEXT_PUBLIC_APP_URL=' "$ENV_FILE" | sed 's/=.*/=***/'
