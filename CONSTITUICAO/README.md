# CONSTITUICAO

Esta pasta concentra os documentos canonicos do Mycelium. Ela existe para
servir como fonte da verdade executavel: os arquivos sao indexados, possuem
hashes validados e nao podem ser alterados sem atualizar o indice.

## Ordem de leitura

1. CRITERIO_FORMAL_DE_ACEITE_DE_INTERFACE.md
2. MANUAL_DE_CONSTRUCAO_MYCELIUM_FRONTEND_v1.0.md
3. ADR-001-Instituicao-Manual-Frontend-Mycelium.md
4. GUIA_COMPLEMENTAR_COGNITIVE_PUZZLE.md

## Operacao

- Gerar o indice: `npm run constitution:index`
- Validar a constituicao: `npm run guard:constitution`

Regras:
- `index.json` e gerado automaticamente.
- Qualquer alteracao nos documentos canonicos exige rodar `npm run constitution:index`.
