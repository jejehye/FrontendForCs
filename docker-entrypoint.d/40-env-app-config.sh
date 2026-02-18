#!/bin/sh
set -eu

TEMPLATE_PATH="/usr/share/nginx/html/app-config.template.js"
OUTPUT_PATH="/usr/share/nginx/html/app-config.js"

if [ -f "$TEMPLATE_PATH" ]; then
  envsubst < "$TEMPLATE_PATH" > "$OUTPUT_PATH"
fi
