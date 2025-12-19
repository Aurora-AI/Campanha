# 📑 OS-ALVARO-TRANSPLANTE-PASSIVO-001 (FINAL)
## Implante do Álvaro Observer Kit no Mycelium (Campanha)

**Executor:** CODEX (modelo 5.2)
**Onde executar:** Projeto Mycelium / Campanha — `C:\Aurora\Campanha`
**Prioridade:** Alta
**Status:** Executada localmente (pendente de commit) / Pronta para auditoria

---

## 0) Pré-condições (gates)
Rodar em `C:\Aurora\Campanha`:
- npm run guard:docs
- npm run gate:all

---

## 1) Objetivo
Implantar o Álvaro como órgão observador passivo e read-only no Campanha para curadoria de knowledge via artifacts e indexação auditável.

---

## 2) Entregáveis
Criar no Campanha:
- alvaro/README.md
- alvaro/policies/ALVARO_MODE_OBSERVER.md
- alvaro/knowledge/index.json
- alvaro/ingest/ingest_artifacts.ps1
- alvaro/ingest/ingest_artifacts.sh
Adicionar task opcional VSCode `alvaro:ingest` fora do gate:all.

Executar ingest:
- gerar artifacts/alvaro_ingest.log
- atualizar alvaro/knowledge/index.json

Validar gates e preparar commit.

---

## 3) Regras absolutas
- Não criar APIs/rotas do Álvaro
- Não inserir ingest no gate:all
- Não acoplar repos via submodule/subtree
- Read-only, sem vias eferentes

---

## 4) Evidências
- artifacts/alvaro_ingest.log
- index.json com itens indexados
- gates passando

FIM
