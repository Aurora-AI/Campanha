$ErrorActionPreference = "Stop"

function Log($msg) {
  $ts = (Get-Date).ToString("s")
  Write-Host "[$ts] $msg"
}

function Run($exe, $args) {
  & $exe @args
  if ($LASTEXITCODE -ne 0) {
    throw ("Falha ao executar: {0} {1}" -f $exe, ($args -join " "))
  }
}

$repo = "C:\Aurora\Campanha"
Set-Location $repo

$branch = (git -C $repo rev-parse --abbrev-ref HEAD).Trim()
if ($branch -ne "main") {
  Log "ABORT: branch atual '$branch' != 'main'."
  exit 0
}

Log "Pull Campanha (evitar divergência)"
Run git @("pull", "--rebase")

Log "Rodando ingest do Álvaro (Campanha)"
Run powershell @(
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-File",
  (Join-Path $repo "alvaro\ingest\ingest_artifacts.ps1")
)

Log "Verificando mudanças"
$changes = git status --porcelain
if (-not $changes) {
  Log "Sem mudanças no Campanha. Encerrando."
  exit 0
}

$unexpected = @()
foreach ($line in @($changes -split "`n")) {
  $trim = $line.Trim()
  if (-not $trim) { continue }
  if ($trim.Length -lt 4) { continue }
  $path = $trim.Substring(3).Trim().Replace("\", "/")
  if ($path -eq "alvaro/knowledge/index.json") { continue }
  if ($path.StartsWith("artifacts/")) { continue }
  $unexpected += $path
}
if ($unexpected.Count -gt 0) {
  Log ("FAIL mudanças fora do escopo (abortar para não commitar lixo): {0}" -f ($unexpected -join ", "))
  exit 1
}

Log "Commit e push (Campanha)"
Run git @("add", "--", "alvaro/knowledge/index.json", "artifacts")
& git reset HEAD -- artifacts/alvaro_ingest.log 2>$null | Out-Null

& git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Log "Sem mudanças relevantes para commitar no Campanha. Encerrando."
  exit 0
}

Log "Rodando gate:all (obrigatório para push)"
Run npm @("run", "gate:all")

$stamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
Run git @("commit", "-m", ("chore(alvaro): ingest artifacts + update index ({0})" -f $stamp))

Run git @("push")

Log "OK Campanha atualizado e enviado."
