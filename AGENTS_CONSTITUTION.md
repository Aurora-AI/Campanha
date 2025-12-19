# Constituição Operacional dos Agentes — Projeto Campanha (Mycelium)
## Governança obrigatória para execução de OS por agentes CLI (VSCode)

Status: 🟢 VIGENTE  
Aplicação: Todas as OS, commits e PRs executados por agentes (CODEX, CLI/IDE, automações VSCode)  
Repositório (absoluto): C:\Aurora\Campanha  
Repositório (relativo): `./`

---

## 1. Propósito

Esta Constituição define **regras imutáveis** que todos os agentes CLI devem seguir para executar qualquer Ordem de Serviço (OS) neste repositório.

Objetivo: **eliminar ambiguidades**, impedir drift de doutrina e garantir que o produto evolua com **homeostase técnica** e **homeostase cognitiva**.

---

## 2. Fontes de Verdade (Documentos Normativos)

Os agentes DEVEM ler, indexar e obedecer a estes documentos **antes de qualquer execução**:

1. Absoluto: `C:\Aurora\Campanha\Manual_de_Construcao_Aurora_v4.0.txt`  
   Relativo: `./Manual_de_Construcao_Aurora_v4.0.txt`
2. Absoluto: `C:\Aurora\Campanha\MANUAL_DE_CONSTRUCAO_MYCELIUM_FRONTEND_v1.0.md`  
   Relativo: `./MANUAL_DE_CONSTRUCAO_MYCELIUM_FRONTEND_v1.0.md`
3. Absoluto: `C:\Aurora\Campanha\ADR-001-Instituicao-Manual-Frontend-Mycelium.md`  
   Relativo: `./ADR-001-Instituicao-Manual-Frontend-Mycelium.md`
4. Absoluto: `C:\Aurora\Campanha\guia_complementar_cognitive_puzzle.md` (contrato editorial/visual)  
   Relativo: `./guia_complementar_cognitive_puzzle.md`

Regra: o agente deve executar o gate `guard:docs` antes de qualquer tarefa operacional relevante.

---

## 2.1 Ordem de Precedência (Conflitos)

Em qualquer conflito de doutrina/arquitetura/estilo:

1. `./Manual_de_Construcao_Aurora_v4.0.txt`
2. `./MANUAL_DE_CONSTRUCAO_MYCELIUM_FRONTEND_v1.0.md`
3. `./ADR-001-Instituicao-Manual-Frontend-Mycelium.md`
4. `./guia_complementar_cognitive_puzzle.md`

Regra: em caso de dúvida, parar e escalar para Rodrigo (detentor do contexto).

---

## 3. Regra-Mãe de Separação (Backend x Frontend)

- Backend (Aurora) **decide, calcula, valida e produz inteligência**.
- Frontend (Mycelium) **manifesta estados**, preserva experiência e contratos visuais.
- **UI NÃO calcula. UI consome inteligência.**

Qualquer lógica de negócio introduzida em `app/` ou `components/` é **violação grave**.

---

## 4. Estados Oficiais da Campanha (Exclusivos)

Somente estes estados são permitidos, em qualquer camada de UI/experiência:

- 🟢 NO JOGO
- 🟡 EM DISPUTA
- 🔴 FORA DO RITMO

Proibido:
- criar subestados
- criar variações semânticas
- inferir estado em UI

Qualquer PR que introduza novos estados deve ser rejeitado.

---

## 5. Contratos Visuais (Cognitive Puzzle)

O guia `guia_complementar_cognitive_puzzle.md` define a arquitetura editorial e visual.

Regras obrigatórias:
- **Ativos visuais são imutáveis. Conteúdo é mutável.**
- Dados ocupam slots; dados não criam novos ativos.
- Hero não reage a dados além de preenchimento de slots.

---

## 6. Antigravity (Gênese e Clonagem de Design)

O Antigravity é ferramenta oficial de:
- gênese visual
- validação fenomenológica
- clonagem controlada de layouts

Regra: qualquer “clone” deve preservar contratos:
- visual
- cognitivo
- editorial

---

## 7. Execução Obrigatória (Gates)

Antes de executar qualquer OS (inclusive esta):
1. `guard:docs` — valida presença e hashes dos documentos normativos
2. `guard:frontend` — valida contratos e anti-padrões no frontend (heurístico + regras explícitas)
3. `quality:typecheck` — `npm run type-check` (se existir) ou equivalente

Se algum gate falhar:
- o agente deve parar
- registrar evidências
- escalar para Rodrigo

---

## 8. Política de Conflito e Escalonamento

Em caso de conflito entre:
- intenção visual (vídeo/Antigravity)
- código existente
- documentos normativos

O agente deve:
1. parar execução
2. abrir registro no corpo da OS (seção “Conflitos”)
3. escalar para Rodrigo (detentor do contexto)

Nenhuma “decisão criativa” é permitida ao agente.

---

## 9. Conclusão

A partir desta Constituição, a operação é governada por:
- Doutrina de Engenharia (Aurora v4.0)
- Doutrina de Interface (Mycelium Frontend v1.0 + ADR-001)
- Doutrina Editorial (Cognitive Puzzle)

Qualquer violação implica rejeição automática do trabalho.

FIM DO DOCUMENTO

