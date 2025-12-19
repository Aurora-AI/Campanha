#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

warn() { echo "[GUARD:FRONTEND] WARN - $1"; }
fail() { echo "[GUARD:FRONTEND] FAIL - $1" >&2; exit 1; }
ok() { echo "[GUARD:FRONTEND] OK   - $1"; }

SCAN_DIRS=("$ROOT_DIR/app" "$ROOT_DIR/components" "$ROOT_DIR/lib" "$ROOT_DIR/schemas")
EXISTING=()
for d in "${SCAN_DIRS[@]}"; do
  [[ -d "$d" ]] && EXISTING+=("$d")
done

if [[ "${#EXISTING[@]}" -eq 0 ]]; then
  warn "Nenhum diretório padrão encontrado (app/components/lib/schemas). Nada a validar."
  exit 0
fi

if [[ -f "$ROOT_DIR/schemas/hero.schema.ts" ]]; then
  ok "Schema encontrado: schemas/hero.schema.ts"
else
  warn "schemas/hero.schema.ts ainda não existe. (Pode ser criado pela OS de deploy)."
fi

FILES=()
while IFS= read -r -d '' f; do FILES+=("$f"); done < <(find "${EXISTING[@]}" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0)

UNKNOWN_STATE_HITS=()
LOGIC_HITS=()

STATE_VARIANTS_REGEX='NOJOGO|EMDISPUTA|FORADORIZMO|FORA DO JOGO|NO RITMO'
FORBIDDEN_TOKENS_REGEX='threshold|percent|percentage|>=|<=|Math\.|reduce\(|sort\('

is_excluded_rel() {
  local rel="$1"
  [[ "$rel" == app/api/* || "$rel" == app/sandbox/* || "$rel" == components/sandbox/* || "$rel" == components/_legacy/* ]]
}

is_logic_allowlisted() {
  local rel="$1"
  [[ "$rel" == "components/SmoothScroll.tsx" || "$rel" == "components/PuzzlePhysicsHero.tsx" || "$rel" == "components/Hero.tsx" ]]
}

for f in "${FILES[@]}"; do
  rel="${f#${ROOT_DIR}/}"
  content="$(cat "$f")"

  if ! is_excluded_rel "$rel" && ([[ "$rel" == app/* || "$rel" == components/* ]]); then
    if echo "$content" | grep -Eq "$STATE_VARIANTS_REGEX"; then
      UNKNOWN_STATE_HITS+=("$rel :: contém variantes de estado potencialmente proibidas.")
    fi

    if ! is_logic_allowlisted "$rel"; then
      if echo "$content" | grep -Eq "$FORBIDDEN_TOKENS_REGEX"; then
        LOGIC_HITS+=("$rel :: indício de lógica/cálculo em UI (token proibido).")
      fi
    fi
  fi
done

if [[ "${#UNKNOWN_STATE_HITS[@]}" -gt 0 ]]; then
  printf '%s\n' "${UNKNOWN_STATE_HITS[@]}" | sed 's/^/- /' >&2
  fail "Estados/variantes suspeitas encontradas."
fi

if [[ "${#LOGIC_HITS[@]}" -gt 0 ]]; then
  printf '%s\n' "${LOGIC_HITS[@]}" | sed 's/^/- /' >&2
  fail "Indícios de lógica de negócio/cálculo em UI encontrados."
fi

ok "Contratos básicos de frontend validados (heurístico)."
