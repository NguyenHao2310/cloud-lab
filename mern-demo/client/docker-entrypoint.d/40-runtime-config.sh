#!/bin/sh
set -eu

# Bài 5: Render truyền URL công khai của backend khi container khởi động.
api_url="${VITE_API_URL:-}"
if [ -n "$api_url" ]; then
  printf '%s' "$api_url" | grep -Eq '^https?://[A-Za-z0-9.-]+(:[0-9]+)?/?$' || {
    echo 'VITE_API_URL phải là URL gốc http/https của backend.' >&2
    exit 1
  }
fi
printf 'window.__APP_CONFIG__ = { API_URL: "%s" };\n' "${api_url%/}" > /usr/share/nginx/html/config.js
