#!/bin/bash
# Switch the frontend between local backend and RunPod GPU backend.
#
# Usage:
#   ./switch-backend.sh local          → use localhost:8001
#   ./switch-backend.sh <runpod-url>   → use RunPod proxy URL
#   ./switch-backend.sh                → show current setting
#
set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE=".env.local"

if [ $# -eq 0 ]; then
    if [ -f "$ENV_FILE" ] && grep -q "BACKEND_URL" "$ENV_FILE"; then
        echo "Current: $(grep BACKEND_URL "$ENV_FILE")"
    else
        echo "Current: local (http://localhost:8001)"
    fi
    exit 0
fi

TARGET="$1"

if [ "$TARGET" = "local" ]; then
    # Remove BACKEND_URL — defaults to localhost
    if [ -f "$ENV_FILE" ]; then
        grep -v "BACKEND_URL" "$ENV_FILE" > "$ENV_FILE.tmp" || true
        mv "$ENV_FILE.tmp" "$ENV_FILE"
    fi
    echo "▸ Switched to LOCAL backend (localhost:8001)"
else
    # Set RunPod URL
    if [ -f "$ENV_FILE" ]; then
        grep -v "BACKEND_URL" "$ENV_FILE" > "$ENV_FILE.tmp" || true
        mv "$ENV_FILE.tmp" "$ENV_FILE"
    fi
    echo "BACKEND_URL=$TARGET" >> "$ENV_FILE"
    echo "▸ Switched to REMOTE backend: $TARGET"
fi

echo "▸ Rebuilding frontend..."
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
systemctl --user restart woodblock-frontend.service
echo "✓ Frontend restarted. Live at https://tools.reidsurmeier.wtf/"
