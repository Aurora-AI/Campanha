#!/usr/bin/env bash
set -euo pipefail

INIT=0
if [[ "${1:-}" == "--init" ]]; then
  INIT=1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MANIFEST="${ROOT_DIR}/scripts/guard/docs_manifest.json"

fail() {
  echo "[GUARD:DOCS] FAIL - $1" >&2
  exit 1
}

ok() {
  echo "[GUARD:DOCS] OK   - $1"
}

sha256_file() {
  local file="$1"
  if command -v sha256sum >/dev/null 2>&1; then
    tr -d '\r' <"$file" | sha256sum | awk '{print tolower($1)}'
  elif command -v shasum >/dev/null 2>&1; then
    tr -d '\r' <"$file" | shasum -a 256 | awk '{print tolower($1)}'
  else
    fail "Nenhum utilitário SHA256 encontrado (sha256sum/shasum)."
  fi
}

[[ -f "$MANIFEST" ]] || fail "Manifesto ausente: scripts/guard/docs_manifest.json"

if ! command -v jq >/dev/null 2>&1; then
  fail "jq é necessário para rodar este script no Linux/Mac."
fi

DOC_COUNT="$(jq '.documents | length' "$MANIFEST")"
[[ "$DOC_COUNT" -ge 1 ]] || fail "Manifesto inválido: documents vazio."

if [[ "$INIT" -eq 1 ]]; then
  tmp="$(mktemp)"
  cp "$MANIFEST" "$tmp"

  for i in $(seq 0 $((DOC_COUNT - 1))); do
    path="$(jq -r ".documents[$i].path" "$MANIFEST")"
    file="${ROOT_DIR}/${path}"
    [[ -f "$file" ]] || fail "Documento normativo ausente: $path"
    hash="$(sha256_file "$file")"
    jq ".documents[$i].sha256 = \"$hash\"" "$tmp" >"${tmp}.2" && mv "${tmp}.2" "$tmp"
    ok "Hash registrado: $path => $hash"
  done

  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  jq ".generated_at = \"$now\"" "$tmp" >"${tmp}.2" && mv "${tmp}.2" "$tmp"
  mv "$tmp" "$MANIFEST"
  ok "Manifesto atualizado: scripts/guard/docs_manifest.json"
  exit 0
fi

for i in $(seq 0 $((DOC_COUNT - 1))); do
  path="$(jq -r ".documents[$i].path" "$MANIFEST")"
  expected="$(jq -r ".documents[$i].sha256" "$MANIFEST")"
  file="${ROOT_DIR}/${path}"

  [[ -f "$file" ]] || fail "Documento normativo ausente: $path"
  [[ "$expected" != "null" && -n "$expected" ]] || fail "Manifesto não inicializado (sha256 null) para: $path. Rode --init."

  actual="$(sha256_file "$file")"
  if [[ "${actual,,}" != "${expected,,}" ]]; then
    fail "Hash divergente em '$path'. Esperado=${expected,,} Atual=${actual,,}. Atualize somente com aprovação explícita."
  fi
  ok "Documento validado: $path"
done

ok "Todos os documentos normativos estão presentes e íntegros."

