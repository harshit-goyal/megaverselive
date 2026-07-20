#!/usr/bin/env bash
# Rebuild the compiled Tailwind stylesheet from tailwind.config.js.
# Run from the repo root after changing classes in public/*.html:
#   bash scripts/build-css.sh
set -euo pipefail
cd "$(dirname "$0")/.."
npx --yes tailwindcss@3 -c tailwind.config.js -i src/tailwind.input.css -o public/assets/tailwind.css --minify
echo "Built public/assets/tailwind.css"
