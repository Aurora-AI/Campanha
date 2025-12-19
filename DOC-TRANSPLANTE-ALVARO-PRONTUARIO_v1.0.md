# 🩺 DOCUMENTO DE VISÃO — TRANSPLANTE DO PROJETO ÁLVARO
## Integração Passiva no Corpo Mycelium (Projeto Campanha)

**Versão:** 1.0 — Prontuário de Transplante
**Status:** 🟢 APTO PARA PROCEDIMENTO (Implantação concluída, pendente de commit)
**Órgão Transplantado:** Projeto Álvaro (Modo Observador)
**Corpo Receptor:** Projeto Mycelium / Campanha
**Local:** C:\Aurora\Campanha
**Executor Operacional:** CODEX (modelo 5.2)
**Idioma:** Português (BR)

---

## 1. Identificação do Corpo Receptor (Mycelium / Campanha)

### 1.1 Natureza do corpo
O Projeto Campanha (Mycelium) é um organismo digital ativo com governança por documentos normativos e execução via agentes CLI (VSCode/CODEX) com gates operacionais.

Condições clínicas relevantes:
- Interface soberana: Cognitive Puzzle (Home substituída e validada)
- Guardrails: guard:docs + gate:all funcionando
- Evidências operacionais: artifacts gerados e versionáveis

Conclusão clínica: corpo estável, porém sensível a interferência externa e acoplamento entre repositórios.

### 1.2 Funções vitais existentes
- Decisão: humanos + OS
- Execução: agentes CLI (CODEX 5.2)
- Expressão: UI Cognitive Puzzle
- Imunidade: guard scripts e gates
- Evidência: artifacts (logs/screenshot)

---

## 2. Identificação do Órgão (Álvaro) no contexto Campanha

### 2.1 Estado operacional obrigatório
🟦 MODO OBSERVADOR — SILÊNCIO ABSOLUTO

O Álvaro opera exclusivamente em modo:
- read-only
- assíncrono
- fora do caminho crítico

### 2.2 Funções permitidas
- Curadoria de conhecimento gerado por OS, artifacts e consequências
- Indexação auditável do acervo (index.json)

### 2.3 Funções proibidas (absolutas)
- Executar ações no produto
- Alterar código, dados, rotas, estado, UI
- Emitir alertas espontâneos
- Sugerir mudanças sem solicitação explícita
- Criar ou executar OS

---

## 3. Indicação do transplante (por que)
Preservar e organizar conhecimento vivo gerado pela operação:
- OS e decisões
- logs de execução (gates)
- evidências visuais (sentinela)
- histórico por consequência (decisão → impacto)

Não visa ganho funcional imediato; visa memória e curadoria para evolução futura sem contaminar o presente.

---

## 4. Compatibilidade e mitigação de rejeição

### 4.1 Riscos
- Rejeição por interferência: mitigado por read-only e ausência de saída
- Overfitting cognitivo: mitigado por aprendizado por consequência, sem ação
- Acoplamento entre repositórios: mitigado por mirror pull sem submodule/subtree
- Bloqueio de pipeline: mitigado por não inserir ingest no gate:all

### 4.2 Conclusão
Compatível e seguro, desde que:
- permaneça sem vias eferentes
- permaneça não-bloqueante
- mantenha governança documental e guardrails

---

## 5. Procedimento realizado (registro cirúrgico)

### 5.1 Implante no corpo receptor (Campanha)
Criados no Campanha:
- alvaro/README.md
- alvaro/policies/ALVARO_MODE_OBSERVER.md
- alvaro/knowledge/index.json
- alvaro/ingest/ingest_artifacts.ps1
- alvaro/ingest/ingest_artifacts.sh
Task VSCode opcional adicionada em .vscode/tasks.json (fora do gate:all)

### 5.2 Ingestão inicial
Executado ingest no Campanha:
- artifacts/alvaro_ingest.log gerado
- alvaro/knowledge/index.json atualizado (5 itens indexados)

### 5.3 Validação do corpo
Gates no Campanha passaram:
- npm run guard:docs
- npm run gate:all

---

## 6. Espelhamento para o repositório Álvaro (sem acoplamento)
Executado mirror no repo Álvaro via scripts/mirror/mirror_from_myc.ps1:
- knowledge/mycelium/indexes/campanha_index.json gerado
- artifacts copiados para knowledge/mycelium/artifacts (5 itens)

Regra: mirror é pull, read-only, sem submodule/subtree.

---

## 7. Critérios de sucesso (definição)
- O corpo receptor não depende do órgão para funcionar
- O órgão não interfere nem bloqueia execução
- O acervo cresce e é auditável
- O espelhamento funciona sem acoplamento entre repos

---

## 8. Estado atual (pendências)
- Implantação concluída localmente
- Commit pendente nos dois repositórios (Campanha e Álvaro)
- Documentos normativos devem ser congelados (hash) e commitados no Campanha

---

## 9. Assinatura clínica
**Autoridade Executiva:** Rodrigo César Winhaski
**Vigência:** imediata após commit e congelamento dos hashes

FIM
