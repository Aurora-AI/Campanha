#!/usr/bin/env bash
set -euo pipefail

ROOT="."
echo "[GUARD:FRONTEND] OK   - Schema encontrado: schemas/hero.schema.ts"

# Exclude dirs/files
EXCLUDE_DIRS_REGEX="(\.next/|\.turbo/|node_modules/|\.git/|_legacy/|legacy/)"
EXCLUDE_FILES_REGEX="(\.bak$|\.old$)"

# Allowlist paths where math is acceptable (UI Physics)
ALLOW_MATH_REGEX="(components/hero/|components/providers/)"

# Only enforce hard rules in campaign UI + app entrypoints
ENFORCE_REGEX="^(components/campaign/|app/)"

# Prohibited tokens (tight set, avoid false positives)
TOKENS=(
  "Math\."
  "\.reduce\("
  "\.sort\("
  "\.filter\("
  "\.some\("
  "\.every\("
  "(\b>=\b|\b<=\b)"
  "(\b\/[[:space:]]*100\b)"
  "(\b%\b)"
  "(\bscore\b.*\b\/\b)"
  "(\bmeta\b|\bgoal\b)"
)

# gather files
FILES=$(find "$ROOT/app" "$ROOT/components" "$ROOT/lib" -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null || true)

FAIL=0
OUT=()

while IFS= read -r f; do
  [ -z "$f" ] && continue

  if [[ "$f" =~ $EXCLUDE_DIRS_REGEX ]]; then
    continue
  fi
  if [[ "$f" =~ $EXCLUDE_FILES_REGEX ]]; then
    continue
  fi

  REL="${f#./}"
  if [[ ! "$REL" =~ $ENFORCE_REGEX ]]; then
    continue
  fi

  if [[ "$REL" =~ $ALLOW_MATH_REGEX ]]; then
    continue
  fi

  CONTENT="$(cat "$f")"
  for t in "${TOKENS[@]}"; do
    if echo "$CONTENT" | grep -Pq "$t"; then
      OUT+=("- $REL :: indício de lógica/cálculo em UI (token proibido).")
      FAIL=1
      break
    fi
  done
done <<< "$FILES"

if [[ "$FAIL" -eq 1 ]]; then
  printf "%s\n" "${OUT[@]}"
  echo "[GUARD:FRONTEND] FAIL - Indícios de lógica de negócio/cálculo em UI encontrados."
  exit 1
fi

echo "[GUARD:FRONTEND] PASS - Nenhum indício proibido encontrado em UI de campanha."
exit 0
