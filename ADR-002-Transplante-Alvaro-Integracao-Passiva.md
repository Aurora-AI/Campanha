# ADR-002 — Transplante do Projeto Álvaro como Observador Passivo no Mycelium (Campanha)

**Status:** Aceito
**Data:** 18/12/2025
**Decisores:** Rodrigo César Winhaski (Autoridade Executiva), Jules (Intenção/Validação), Aurora (Governança/OS)
**Executor Operacional:** CODEX (modelo 5.2)

---

## Contexto
O Projeto Campanha (Mycelium) está em fase ativa e crítica de transição para uma interface soberana (Cognitive Puzzle).
O conhecimento produzido por OS, execução, erros, acertos e consequências precisa ser preservado de forma estruturada, auditável e cumulativa.

Ao mesmo tempo, introduzir um novo agente em modo ativo aumenta risco de:
- ambiguidades
- loops de feedback
- competição com executores
- rejeição operacional do "corpo receptor"

---

## Decisão
Integrar o Projeto Álvaro ao Campanha exclusivamente como:
- observador passivo
- escuta obrigatória
- silêncio absoluto
- curadoria de conhecimento

A integração deve ser:
- read-only
- assíncrona
- fora do caminho crítico
- sem dependência cruzada de repositórios

---

## Escopo normativo
Permitido:
- ler artifacts e documentos operacionais
- indexar acervo (index.json)
- espelhar acervo para repo Álvaro (pull, sem acoplamento)

Proibido:
- executar ações no produto
- alterar código/dados/rotas/UI
- emitir alertas espontâneos
- recomendar mudanças sem solicitação explícita
- bloquear gates/pipelines

---

## Consequências
Positivas:
- memória histórica auditável
- redução de amnésia operacional
- base para aprendizado por consequência

Custos:
- manutenção de acervo (armazenamento/organização)
- disciplina de evidências e nomenclatura
- controle rigoroso de read-only e isolamento

---

## Implementação (resumo)
- Implantar Observer Kit no Campanha sob pasta /alvaro
- Ingest read-only de artifacts para index.json
- Mirror pull para repo Álvaro sem submodule/subtree

Referência:
- DOC-TRANSPLANTE-ALVARO-PRONTUARIO_v1.0.md

FIM
