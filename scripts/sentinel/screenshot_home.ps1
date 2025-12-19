param(
  [Parameter(Mandatory = $false)]
  [int]$Port = 3100,

  [Parameter(Mandatory = $false)]
  [string]$OutPath = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\\..")).Path
$edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"

if (-not (Test-Path $edgePath)) {
  throw "Microsoft Edge não encontrado em: $edgePath"
}

if (-not $OutPath) {
  $OutPath = Join-Path $repoRoot ("artifacts\\homepage_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".png")
}

$outDir = Split-Path -Parent $OutPath
if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir | Out-Null
}

Push-Location $repoRoot
try {
  & npm run build | Out-Host

  $env:PORT = "$Port"
  $proc = Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "start") -WorkingDirectory $repoRoot -PassThru -NoNewWindow

  try {
    $ok = $false
    for ($i = 0; $i -lt 60; $i++) {
      Start-Sleep -Milliseconds 500
      try {
        $resp = Invoke-WebRequest -Uri ("http://localhost:" + $Port + "/") -UseBasicParsing -TimeoutSec 2
        if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) { $ok = $true; break }
      } catch {
        # keep waiting
      }
    }

    if (-not $ok) {
      throw "Servidor não respondeu em http://localhost:$Port/ dentro do tempo limite."
    }

    & $edgePath --headless --disable-gpu --window-size=1440,900 --screenshot="$OutPath" ("http://localhost:" + $Port + "/") | Out-Host
    Write-Host "[SENTINEL] Screenshot gerado: $OutPath"
  } finally {
    if ($proc -and -not $proc.HasExited) {
      Stop-Process -Id $proc.Id -Force
    }
  }
} finally {
  Pop-Location
}
