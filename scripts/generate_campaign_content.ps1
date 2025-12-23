Param(
  [string]$RepoRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

$source = Join-Path $RepoRoot "lib\sandbox\mock.ts"
$targetDir = Join-Path $RepoRoot "lib\campaign"
$target = Join-Path $targetDir "content.ts"

if (-not (Test-Path $source)) {
  throw "Arquivo fonte nao encontrado: $source"
}

New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

# Le o arquivo inteiro
$text = Get-Content -Path $source -Raw

# Extrai blocos de export const para os simbolos desejados.
# Observacao: assume padrao Typescript comum: export const NAME = ...;
function Extract-ExportConstBlock([string]$name, [string]$t) {
  # Captura "export const NAME = ...;" incluindo objetos/arrays multiline ate o primeiro ";" no nivel mais externo.
  # Estrategia: encontra o inicio e caminha contando chaves/parenteses/colchetes ate fechar e encontrar ";"
  $startIdx = $t.IndexOf("export const $name")
  if ($startIdx -lt 0) { return $null }

  $i = $startIdx
  $len = $t.Length
  $depthParen = 0
  $depthBrace = 0
  $depthBracket = 0
  $inString = $false
  $stringChar = ''
  $escape = $false

  while ($i -lt $len) {
    $ch = $t[$i]

    if ($inString) {
      if ($escape) { $escape = $false }
      elseif ($ch -eq '\\') { $escape = $true }
      elseif ($ch -eq $stringChar) { $inString = $false }
      $i++
      continue
    }

    if ($ch -eq '"' -or $ch -eq "'" -or $ch -eq "`") {
      $inString = $true
      $stringChar = $ch
      $i++
      continue
    }

    switch ($ch) {
      '(' { $depthParen++ }
      ')' { if ($depthParen -gt 0) { $depthParen-- } }
      '{' { $depthBrace++ }
      '}' { if ($depthBrace -gt 0) { $depthBrace-- } }
      '[' { $depthBracket++ }
      ']' { if ($depthBracket -gt 0) { $depthBracket-- } }
      ';' {
        if ($depthParen -eq 0 -and $depthBrace -eq 0 -and $depthBracket -eq 0) {
          $endIdx = $i
          return $t.Substring($startIdx, ($endIdx - $startIdx + 1)).Trim()
        }
      }
    }

    $i++
  }

  return $null
}

$names = @("SECTION_A_DATA", "SECTION_GRID_DATA", "MANIFESTO_DATA")
$blocks = @()

foreach ($n in $names) {
  $b = Extract-ExportConstBlock -name $n -t $text
  if (-not $b) {
    throw "Nao consegui extrair '$n' de $source. Verifique se existe 'export const $n = ...;' no arquivo."
  }
  $blocks += $b
}

# Monta arquivo de saida sob dominio Campaign
$out = @()
$out += "/*"
$out += " * Fonte canonica de conteudo editorial para a rota Campaign."
$out += " * Gerado a partir de lib/sandbox/mock.ts para remover dependencia campaign -> sandbox."
$out += " *"
$out += " * Regra: components/campaign NAO devem importar lib/sandbox/mock."
$out += " */"
$out += ""
$out += ($blocks -join "`n`n")
$out += ""

Set-Content -Path $target -Value ($out -join "`n") -Encoding UTF8

Write-Host "OK: gerado $target"
