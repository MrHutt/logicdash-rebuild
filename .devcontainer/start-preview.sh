#!/usr/bin/env bash
set -euo pipefail

# Codespaces opens port 4323 automatically when Astro is ready.
# Keep this process separate from the Codespaces lifecycle hook.
if pgrep -f '[a]stro preview.*4323' >/dev/null; then
  echo "LogicDash preview already running on port 4323"
  exit 0
fi

echo "Preparing a clean LogicDash production preview..."
nohup bash -lc '
  set -e
  rm -rf dist .astro
  npm run build
  exec npm run preview -- --host 0.0.0.0 --port 4323
' > /tmp/logicdash-preview.log 2>&1 < /dev/null &
echo "Preview starting. View build log: tail -f /tmp/logicdash-preview.log"
