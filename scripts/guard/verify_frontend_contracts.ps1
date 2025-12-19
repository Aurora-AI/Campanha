param(
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"

Write-Host "[GUARD:FRONTEND] OK   - Schema encontrado: schemas/hero.schema.ts"

# Diretórios e arquivos que nunca devem ser analisados
$excludeDirs = @(
  "\.next\",
  "\.turbo\",
  "\node_modules\",
  "\.git\",
  "\_legacy\",
  "\legacy\"
)

$excludeFilePatterns = @(
  "\.bak$",
  "\.old$"
)

# Allowlist: onde matemática é aceitável (UI Physics)
$allowMathPaths = @(
  "components\hero\",
  "components\providers\"
)

function Is-ExcludedPath([string]$p) {
  foreach ($d in $excludeDirs) {
    if ($p -like "*$d*") { return $true }
  }
  foreach ($f in $excludeFilePatterns) {
    if ($p -match $f) { return $true }
  }
  return $false
}

function Is-AllowMathPath([string]$p) {
  foreach ($a in $allowMathPaths) {
    if ($p -like "*$a*") { return $true }
  }
  return $false
}

# Política: Tokens que sugerem "cálculo/negócio em UI"
# (mantemos o conjunto restrito para evitar falsos positivos)
$prohibitedTokens = @(
  "Math\.",
  "\.reduce\(",
  "\.sort\(",
  "\.filter\(",
  "\.some\(",
  "\.every\(",
  "\b>=\b|\b<=\b",
  "\b\/\s*100\b",
  "\b%\b",
  "\bscore\b.*\b\/\b",
  "\bmeta\b|\bgoal\b"
)

# Escopo de análise: App + Components + Lib (exceto allowMath)
$targets = @("app", "components", "lib")
$allFiles = @()

foreach ($t in $targets) {
  $full = Join-Path $Root $t
  if (Test-Path $full) {
    $allFiles += Get-ChildItem -Path $full -Recurse -File -Include *.ts, *.tsx
  }
}

$failures = @()

foreach ($f in $allFiles) {
  $p = $f.FullName

  if (Is-ExcludedPath $p) { continue }

  $rel = Resolve-Path $p | ForEach-Object { $_.Path.Substring((Resolve-Path $Root).Path.Length + 1) }

  # Só aplicamos política rígida em "zona de UI de campanha e entrypoints"
  $isCampaignOrApp = ($rel -like "components\campaign\*") -or ($rel -like "app\*")

  # Se estiver em allowMath, não bloquear matemática (parallax/easing)
  $mathAllowed = Is-AllowMathPath $rel

  if (-not $isCampaignOrApp) {
    continue
  }

  if ($mathAllowed) {
    continue
  }

  $content = Get-Content -Path $p -Raw

  foreach ($token in $prohibitedTokens) {
    if ($content -match $token) {
      $failures += "- $rel :: indício de lógica/cálculo em UI (token proibido)."
      break
    }
  }
}

if ($failures.Count -gt 0) {
  $failures | ForEach-Object { Write-Host $_ }
  Write-Host "[GUARD:FRONTEND] FAIL - Indícios de lógica de negócio/cálculo em UI encontrados."
  exit 1
}

Write-Host "[GUARD:FRONTEND] PASS - Nenhum indício proibido encontrado em UI de campanha."
exit 0
