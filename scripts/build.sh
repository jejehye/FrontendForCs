#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

cd "$ROOT_DIR"
npm run render
npm run build:css
npm run copy:fontawesome
cp "$DIST_DIR/app.css" "$ROOT_DIR/app.css"

cp -R "$ROOT_DIR/css" "$DIST_DIR/"
cp -R "$ROOT_DIR/javascript" "$DIST_DIR/"
if [ -d "$ROOT_DIR/js" ]; then
  cp -R "$ROOT_DIR/js" "$DIST_DIR/"
fi
cp -R "$ROOT_DIR/design" "$DIST_DIR/"

echo "Build completed: $DIST_DIR"
