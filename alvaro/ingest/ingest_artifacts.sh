#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ARTIFACTS_DIR="${ROOT_DIR}/artifacts"
INDEX_PATH="${ROOT_DIR}/alvaro/knowledge/index.json"
LOG_PATH="${ARTIFACTS_DIR}/alvaro_ingest.log"

mkdir -p "$ARTIFACTS_DIR"

log() {
  ts="$(date -Iseconds)"
  line="[$ts] $1"
  echo "$line"
  echo "$line" >> "$LOG_PATH"
}

[[ -f "$INDEX_PATH" ]] || { log "FAIL index.json não encontrado"; exit 1; }

GIT_COMMIT=""
GIT_BRANCH=""
if command -v git >/dev/null 2>&1; then
  GIT_COMMIT="$(git -C "$ROOT_DIR" rev-parse HEAD 2>/dev/null || true)"
  GIT_BRANCH="$(git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
fi

log "Ingest iniciado (read-only). Fonte: artifacts/"

if ! command -v jq >/dev/null 2>&1; then
  log "FAIL jq é necessário para ingest no bash"
  exit 1
fi

existing_paths="$(jq -r '.items[].path' "$INDEX_PATH" 2>/dev/null || true)"

new_items="[]"
had_self="false"
if jq -e '.items[]? | select(.path == "artifacts/alvaro_ingest.log")' "$INDEX_PATH" >/dev/null 2>&1; then
  had_self="true"
fi

while IFS= read -r -d '' file; do
  rel="${file#${ROOT_DIR}/}"
  rel="${rel//\\//}"

  if echo "$existing_paths" | grep -qx "$rel"; then
    continue
  fi

  ext="${rel##*.}"
  type="artifact"
  [[ "$ext" == "png" ]] && type="image"
  [[ "$ext" == "log" ]] && type="log"
  [[ "$ext" == "json" ]] && type="json"

  id="$(date +%Y%m%d_%H%M%S)_$(openssl rand -hex 4 2>/dev/null || echo $RANDOM)"

  created_at="$(date -Iseconds)"
  size_bytes="$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")"

  item="$(jq -n \
    --arg id "$id" \
    --arg type "$type" \
    --arg path "$rel" \
    --arg created_at "$created_at" \
    --arg updated_at "$created_at" \
    --arg git_commit "$GIT_COMMIT" \
    --arg git_branch "$GIT_BRANCH" \
    --argjson size_bytes "$size_bytes" \
    '{id:$id,type:$type,path:$path,created_at:$created_at,updated_at:$updated_at,size_bytes:$size_bytes,git_commit:$git_commit,git_branch:$git_branch,tags:[],related_os:null}'
  )"

  new_items="$(jq -n --argjson a "$new_items" --argjson b "[$item]" '$a + $b')"
done < <(find "$ARTIFACTS_DIR" -type f \( -name "*.log" -o -name "*.png" -o -name "*.json" \) -print0)

now="$(date -Iseconds)"

count="$(echo "$new_items" | jq 'length')"
if [[ "$count" == "0" && "$had_self" != "true" ]]; then
  log "Sem novos itens. Index não alterado."
  exit 0
fi

tmp="$(mktemp)"
jq --arg now "$now" --argjson newItems "$new_items" '
  .generated_at = $now |
  .items = (.items | map(select(.path != "artifacts/alvaro_ingest.log"))) |
  .items = (.items + $newItems)
' "$INDEX_PATH" > "$tmp"
mv "$tmp" "$INDEX_PATH"

log "Ingest concluído. Novos itens: ${count}. Index: alvaro/knowledge/index.json"
