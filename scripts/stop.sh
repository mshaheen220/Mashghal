#!/usr/bin/env bash
# Stops the Mashghal dashboard and every workshop app it links to.
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

echo "==> Stopping Mashghal dashboard"
docker compose down

stop_project() {
  local dir="$1"
  if [ ! -f "$dir/docker-compose.yml" ]; then
    return
  fi
  echo "==> Stopping $(basename "$dir")"
  (cd "$dir" && docker compose down)
}

stop_project "$THREED_PRINTING_WORKSHOP_PATH"
stop_project "$PLATESMITH_PATH"
stop_project "$CHOCOLATE_MOLD_FACTORY_PATH"

echo "All stopped."
