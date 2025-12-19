$ErrorActionPreference = "Stop"

Write-Host "=== Daily Álvaro Cycle START ==="

& "C:\Aurora\Campanha\scripts\alvaro\auto_ingest_and_push.ps1"
& "C:\Aurora\Alvaro\scripts\mirror\auto_mirror_and_push.ps1" -sourceRoot "C:\Aurora\Campanha"

Write-Host "=== Daily Álvaro Cycle END ==="

