$ErrorActionPreference = "Stop"

function Log($msg) {
  $ts = (Get-Date).ToString("s")
  $line = "[$ts] $msg"
  Write-Host $line
  Add-Content -Path $logPath -Value $line
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$artifactsDir = Join-Path $repoRoot "artifacts"
$alvaroDir = Join-Path $repoRoot "alvaro"
$indexPath = Join-Path $alvaroDir "knowledge\index.json"
$logPath = Join-Path $artifactsDir "alvaro_ingest.log"

if (-not (Test-Path $artifactsDir)) { New-Item -ItemType Directory -Path $artifactsDir | Out-Null }
if (-not (Test-Path $alvaroDir)) { throw "Diretório alvaro/ não encontrado." }
if (-not (Test-Path $indexPath)) { throw "index.json não encontrado em alvaro/knowledge." }

Log "Ingest iniciado (read-only). Fonte: artifacts/"

$indexRaw = Get-Content -Raw -Path $indexPath
$index = $indexRaw | ConvertFrom-Json

# Captura metadados git (se disponível)
$gitCommit = $null
$gitBranch = $null
try {
  $gitCommit = (git -C $repoRoot rev-parse HEAD).Trim()
  $gitBranch = (git -C $repoRoot rev-parse --abbrev-ref HEAD).Trim()
} catch {
  Log "Git metadata indisponível (ok)."
}

# Coletar arquivos relevantes
$files = @()
if (Test-Path $artifactsDir) {
  $files = Get-ChildItem -Path $artifactsDir -File -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -in @(".log", ".png", ".json") }
}

# Indexação idempotente por path + tamanho + data
$existing = @{}
foreach ($it in $index.items) {
  $existing[$it.path] = $true
}

$newItems = @()
foreach ($f in $files) {
  $relPath = $f.FullName.Replace($repoRoot.Path + "\", "").Replace("\", "/")
  if ($existing.ContainsKey($relPath)) { continue }

  $type = "artifact"
  if ($f.Extension -eq ".png") { $type = "image" }
  elseif ($f.Extension -eq ".log") { $type = "log" }
  elseif ($f.Extension -eq ".json") { $type = "json" }

  $id = ("{0}_{1}" -f (Get-Date -Format "yyyyMMdd_HHmmss"), ([Guid]::NewGuid().ToString("N").Substring(0,8)))

  $newItems += [PSCustomObject]@{
    id = $id
    type = $type
    path = $relPath
    created_at = $f.CreationTime.ToString("s")
    updated_at = $f.LastWriteTime.ToString("s")
    size_bytes = $f.Length
    git_commit = $gitCommit
    git_branch = $gitBranch
    tags = @()
    related_os = $null
  }
}

$index.generated_at = (Get-Date).ToString("s")
$index.items = @($index.items) + $newItems

($index | ConvertTo-Json -Depth 12) | Set-Content -Path $indexPath -Encoding UTF8

Log ("Ingest concluído. Novos itens: {0}. Index: alvaro/knowledge/index.json" -f $newItems.Count)
exit 0
