#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

cd "$ROOT_DIR"
npm run build

for static_dir in css javascript; do
  if [ -d "$ROOT_DIR/$static_dir" ]; then
    cp -R "$ROOT_DIR/$static_dir" "$DIST_DIR/"
  fi
done

echo "Build completed: $DIST_DIR"
