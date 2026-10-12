#!/bin/sh
set -eu

# Bài 6: Nginx nhận upstream lúc chạy; trình duyệt chỉ gọi cùng domain /api/.
export PORT="${PORT:-80}"
export BACKEND_URL="${BACKEND_URL:-https://mern-backend-235692.onrender.com}"
printf '%s' "$PORT" | grep -Eq '^[0-9]+$' || { echo 'PORT không hợp lệ' >&2; exit 1; }
printf '%s' "$BACKEND_URL" | grep -Eq '^https?://[A-Za-z0-9.-]+(:[0-9]+)?/?$' || {
    echo 'BACKEND_URL phải là URL gốc http/https của backend.' >&2
    exit 1
}
BACKEND_URL="${BACKEND_URL%/}"
export BACKEND_URL
DNS_RESOLVERS=$(awk '/^nameserver/ && $2 !~ /:/ {printf "%s ", $2}' /etc/resolv.conf)
export DNS_RESOLVERS
test -n "$DNS_RESOLVERS" || { echo 'Container thiếu DNS resolver IPv4' >&2; exit 1; }

# Chỉ thay biến cấu hình; giữ nguyên $uri, $proxy_host và các biến của Nginx.
envsubst '${PORT} ${BACKEND_URL} ${DNS_RESOLVERS}' < /etc/nginx/nginx-cloud-lab.template > /etc/nginx/conf.d/default.conf
nginx -t
