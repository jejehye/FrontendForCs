#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

cp "$ROOT_DIR/login.html" "$DIST_DIR/"
cp -R "$ROOT_DIR/css" "$DIST_DIR/"
cp -R "$ROOT_DIR/javascript" "$DIST_DIR/"
cp -R "$ROOT_DIR/design" "$DIST_DIR/"

echo "Build completed: $DIST_DIR"
