# Álvaro — Observer Kit (Mycelium)

Este diretório implementa o Álvaro como órgão observador passivo dentro do Projeto Campanha.

- Não interfere no runtime
- Não cria rotas
- Não bloqueia gates
- Apenas indexa artifacts e conhecimento (read-only)

Entrada principal:
- `../artifacts/`

Saída:
- `./knowledge/index.json`

Execução:
- PowerShell: `.\alvaro\ingest\ingest_artifacts.ps1`
- Bash: `./alvaro/ingest/ingest_artifacts.sh`

FIM
