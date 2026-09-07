#!/usr/bin/env bash
# Brings up every workshop app, then the Mashghal dashboard itself.
# This is the intended "start everything after a reboot" entry point.
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

CHOCOLATE_MOLD_FACTORY_PATH="${CHOCOLATE_MOLD_FACTORY_PATH:-../chocolate-mold-factory}"
PLATESMITH_PATH="${PLATESMITH_PATH:-../platesmith}"
THREED_PRINTING_WORKSHOP_PATH="${THREED_PRINTING_WORKSHOP_PATH:-../../3d-printing-workshop}"

start_project() {
  local dir="$1"
  if [ ! -f "$dir/docker-compose.yml" ]; then
    echo "warning: no docker-compose.yml found in $dir, skipping" >&2
    return
  fi
  echo "==> Starting $(basename "$dir")"
  (cd "$dir" && docker compose up -d --build)
}

start_project "$CHOCOLATE_MOLD_FACTORY_PATH"
start_project "$PLATESMITH_PATH"
start_project "$THREED_PRINTING_WORKSHOP_PATH"

echo "==> Starting Mashghal dashboard"
docker compose up -d --build

echo
echo "Mashghal is up: http://localhost:${DASHBOARD_PORT:-4000}"
