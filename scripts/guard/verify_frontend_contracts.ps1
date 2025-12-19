$ErrorActionPreference = "Stop"

function Write-Fail($msg) {
  Write-Host "[GUARD:FRONTEND] FAIL - $msg" -ForegroundColor Red
  exit 1
}
function Write-Warn($msg) {
  Write-Host "[GUARD:FRONTEND] WARN - $msg" -ForegroundColor Yellow
}
function Write-Ok($msg) {
  Write-Host "[GUARD:FRONTEND] OK   - $msg" -ForegroundColor Green
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\\..")).Path

$scanDirs = @(
  (Join-Path $repoRoot "app"),
  (Join-Path $repoRoot "components"),
  (Join-Path $repoRoot "lib"),
  (Join-Path $repoRoot "schemas")
)

$existing = $scanDirs | Where-Object { Test-Path $_ }
if ($existing.Count -eq 0) {
  Write-Warn "Nenhum diretório padrão encontrado (app/components/lib/schemas). Nada a validar."
  exit 0
}

$schemaHero = Join-Path $repoRoot "schemas\\hero.schema.ts"
if (-not (Test-Path $schemaHero)) {
  Write-Warn "schemas/hero.schema.ts ainda não existe. (Pode ser criado pela OS de deploy)."
} else {
  Write-Ok "Schema encontrado: schemas/hero.schema.ts"
}

$files =
  Get-ChildItem -Path $existing -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Extension -in ".ts", ".tsx" }

function Get-Text($path) {
  return Get-Content -Raw -Path $path -ErrorAction SilentlyContinue
}

$unknownStateHits = @()
$logicHits = @()

$forbiddenLogicTokens = @(
  "threshold",
  "percent",
  "percentage",
  ">=",
  "<=",
  'Math\.',
  'reduce\(',
  'sort\('
)

$stateVariantRegex = "NOJOGO|EMDISPUTA|FORADORIZMO|FORA DO JOGO|NO RITMO"

$excludedRelPrefixes = @(
  'app\api\',
  'components\sandbox\',
  'components\_legacy\',
  'app\sandbox\'
)

$logicAllowlistRel = @(
  'components\SmoothScroll.tsx',
  'components\PuzzlePhysicsHero.tsx',
  'components\Hero.tsx'
)

function Is-ExcludedRel([string]$relPath) {
  foreach ($p in $excludedRelPrefixes) {
    if ($relPath.StartsWith($p)) { return $true }
  }
  return $false
}

function Is-AllowlistedForLogic([string]$relPath) {
  foreach ($p in $logicAllowlistRel) {
    if ($relPath -eq $p) { return $true }
  }
  return $false
}

foreach ($f in $files) {
  $rel = $f.FullName.Substring($repoRoot.Length).TrimStart("\")
  $text = Get-Text $f.FullName
  if (-not $text) { continue }

  $isUI = ($rel.StartsWith('app\') -or $rel.StartsWith('components\')) -and (-not (Is-ExcludedRel $rel))

  if ($isUI -and ($text -match $stateVariantRegex)) {
    $unknownStateHits += "$rel :: contém variantes de estado potencialmente proibidas."
  }

  if ($isUI -and (-not (Is-AllowlistedForLogic $rel))) {
    foreach ($tok in $forbiddenLogicTokens) {
      if ($text -match $tok) {
        $logicHits += "$rel :: token lógico suspeito encontrado: $tok"
      }
    }
  }
}

if ($unknownStateHits.Count -gt 0) {
  Write-Fail ("Estados/variantes suspeitas encontradas:`n- " + ($unknownStateHits -join "`n- "))
}

if ($logicHits.Count -gt 0) {
  Write-Fail ("Indícios de lógica de negócio/cálculo em UI encontrados:`n- " + ($logicHits -join "`n- "))
}

Write-Ok "Contratos básicos de frontend validados (heurístico): sem variantes de estado e sem tokens de lógica em UI."
exit 0
