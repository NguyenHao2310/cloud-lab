#!/usr/bin/env bash
# [DỰ PHÒNG — bình thường KHÔNG cần chạy]
#
# docker-compose.yml hiện dùng `network_mode: bridge` (docker0), mà Docker tự tạo
# rule cho docker0 ở mỗi lần Codespace khởi động -> không còn lỗi mạng nữa.
# Script này chỉ cần đến nếu sau này bạn quay lại dùng network riêng của compose
# (hoặc thêm `networks:` vào file compose).
#
# Sửa lỗi container trên network riêng của docker-compose không ra được Internet
# (biểu hiện: mongodb+srv báo querySrv ETIMEOUT / ESERVFAIL).
#
# Nguyên nhân: Codespace chạy song song 2 backend iptables. Docker mới ghi rule vào
# backend "nft", nhưng backend "legacy" vẫn active với chain FORWARD policy DROP và
# chỉ ACCEPT cho docker0. Bridge của compose không khớp rule nào -> bị DROP.
#
# Rule iptables KHÔNG tồn tại qua lần restart Codespace -> chạy lại script này khi cần.
set -euo pipefail

BRIDGE="${1:-mern-br}"
SUBNET="${2:-172.20.0.0/16}"

if ! command -v iptables-legacy >/dev/null 2>&1; then
  echo "Không có iptables-legacy — có thể môi trường này không dính lỗi. Bỏ qua."
  exit 0
fi

# -C kiểm tra rule đã tồn tại chưa -> chạy lại nhiều lần vẫn an toàn
add() {
  if sudo iptables-legacy "$@" -C 2>/dev/null; then :; fi
}
ensure() {          # ensure <table-args...>
  local chain_args=("$@")
  if ! sudo iptables-legacy -C "${chain_args[@]}" 2>/dev/null; then
    sudo iptables-legacy -I "${chain_args[@]}"
    echo "  + thêm: ${chain_args[*]}"
  else
    echo "  = đã có: ${chain_args[*]}"
  fi
}
ensure_nat() {
  if ! sudo iptables-legacy -t nat -C "$@" 2>/dev/null; then
    sudo iptables-legacy -t nat -A "$@"
    echo "  + thêm (nat): $*"
  else
    echo "  = đã có (nat): $*"
  fi
}

echo "Cấu hình cho bridge '$BRIDGE' (subnet $SUBNET):"
# Cho phép forward giống hệt những gì docker0 đang có
ensure FORWARD -o "$BRIDGE" -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
ensure FORWARD -i "$BRIDGE" ! -o "$BRIDGE" -j ACCEPT
ensure FORWARD -i "$BRIDGE" -o "$BRIDGE" -j ACCEPT
# NAT gói tin ra ngoài thành IP của host
ensure_nat POSTROUTING -s "$SUBNET" ! -o "$BRIDGE" -j MASQUERADE

echo "✅ Xong."
