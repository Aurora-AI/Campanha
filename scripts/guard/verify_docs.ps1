param(
  [Parameter(Mandatory = $false)]
  [switch]$init
)

$ErrorActionPreference = "Stop"

if (-not $init -and ($args -contains "--init")) {
  $init = $true
}

function Write-Fail($msg) {
  Write-Host "[GUARD:DOCS] FAIL - $msg" -ForegroundColor Red
  exit 1
}

function Write-Ok($msg) {
  Write-Host "[GUARD:DOCS] OK   - $msg" -ForegroundColor Green
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\\..")).Path
$manifestPath = Join-Path $PSScriptRoot "docs_manifest.json"

if (-not (Test-Path $manifestPath)) {
  Write-Fail "Manifesto ausente: scripts/guard/docs_manifest.json"
}

$manifestRaw = Get-Content -Raw -Path $manifestPath
$manifest = $manifestRaw | ConvertFrom-Json

if (-not $manifest.documents -or $manifest.documents.Count -lt 1) {
  Write-Fail "Manifesto inválido: campo 'documents' ausente ou vazio."
}

function Get-Sha256Normalized([string]$path) {
  if (-not (Test-Path $path)) {
    return $null
  }

  $bytes = [System.IO.File]::ReadAllBytes($path)
  $normalized = New-Object System.Collections.Generic.List[byte]
  foreach ($b in $bytes) {
    if ($b -ne 13) { [void]$normalized.Add($b) }
  }

  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $hashBytes = $sha.ComputeHash($normalized.ToArray())
    return ([System.BitConverter]::ToString($hashBytes)).Replace("-", "").ToLower()
  } finally {
    $sha.Dispose()
  }
}

if ($init) {
  foreach ($doc in $manifest.documents) {
    $docPath = Join-Path $repoRoot $doc.path
    if (-not (Test-Path $docPath)) {
      Write-Fail "Documento normativo ausente: $($doc.path)"
    }
    $sha = Get-Sha256Normalized $docPath
    $doc.sha256 = $sha
    Write-Ok "Hash registrado: $($doc.path) => $sha"
  }

  $manifest.generated_at = (Get-Date).ToString("s")
  ($manifest | ConvertTo-Json -Depth 10) | Set-Content -Path $manifestPath -Encoding UTF8
  Write-Ok "Manifesto atualizado: scripts/guard/docs_manifest.json"
  exit 0
}

foreach ($doc in $manifest.documents) {
  $docPath = Join-Path $repoRoot $doc.path
  if (-not (Test-Path $docPath)) {
    Write-Fail "Documento normativo ausente: $($doc.path)"
  }

  if (-not $doc.sha256) {
    Write-Fail "Manifesto não inicializado (sha256 null) para: $($doc.path). Rode guard:docs:init."
  }

  $actual = Get-Sha256Normalized $docPath
  $expected = $doc.sha256.ToLower()

  if ($actual -ne $expected) {
    Write-Fail "Hash divergente em '$($doc.path)'. Esperado=$expected Atual=$actual. Atualize somente com aprovação explícita."
  }

  Write-Ok "Documento validado: $($doc.path)"
}

Write-Ok "Todos os documentos normativos estão presentes e íntegros."
exit 0

