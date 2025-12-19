#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3100}"
OUT="${1:-}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ -z "$OUT" ]]; then
  ts="$(date -u +"%Y%m%d_%H%M%S")"
  OUT="${ROOT_DIR}/artifacts/homepage_${ts}.png"
fi

mkdir -p "$(dirname "$OUT")"

echo "[SENTINEL] Build"
(cd "$ROOT_DIR" && npm run build)

echo "[SENTINEL] Start server on :$PORT"
(cd "$ROOT_DIR" && PORT="$PORT" npm run start) &
PID="$!"

cleanup() {
  kill "$PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "[SENTINEL] Waiting for http://localhost:$PORT/"
for _ in $(seq 1 60); do
  if curl -fsS "http://localhost:${PORT}/" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

if ! curl -fsS "http://localhost:${PORT}/" >/dev/null 2>&1; then
  echo "[SENTINEL] FAIL - server did not respond" >&2
  exit 1
fi

if command -v chromium >/dev/null 2>&1; then
  chromium --headless --disable-gpu --window-size=1440,900 --screenshot="$OUT" "http://localhost:${PORT}/" >/dev/null 2>&1 || true
elif command -v google-chrome >/dev/null 2>&1; then
  google-chrome --headless --disable-gpu --window-size=1440,900 --screenshot="$OUT" "http://localhost:${PORT}/" >/dev/null 2>&1 || true
else
  echo "[SENTINEL] FAIL - chromium/google-chrome not found for screenshot" >&2
  exit 1
fi

echo "[SENTINEL] Screenshot gerado: $OUT"

