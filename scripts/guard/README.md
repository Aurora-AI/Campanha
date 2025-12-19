# Guard Scripts — Campanha (Mycelium)

## Visão Geral
Este diretório contém guardrails obrigatórios para agentes CLI e execução via VSCode.

## Fluxo padrão
1) Inicializar hashes (uma vez, após documentos aprovados):
- VSCode Task: `guard:docs:init`
ou
- PowerShell: `.\scripts\guard\verify_docs.ps1 --init`

2) Execução normal (antes de qualquer OS):
- VSCode Task: `gate:all`
ou
- `guard:docs` + `guard:frontend` + `npm run type-check`

## Regras
- Se `docs_manifest.json` não estiver inicializado (sha256 null), `guard:docs` falha.
- Qualquer mudança em documento normativo deve ser deliberada e registrada (atualizar hash via `--init` apenas com aprovação explícita).

FIM

