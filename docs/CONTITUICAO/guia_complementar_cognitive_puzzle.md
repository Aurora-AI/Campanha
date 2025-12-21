# GUIA COMPLEMENTAR — ARQUITETURA COGNITIVE PUZZLE

**Projeto:** Campanha (Mycelium)
**Status:** Oficial | Complemento ao Guia Principal
**Versão:** 1.0

---

## 1. Propósito deste Documento

Este documento complementa o **Guia Oficial do Projeto** e tem como objetivo **formalizar a transição definitiva** do Sandbox Antigravity para o **Projeto Real Campanha**, consolidando a arquitetura denominada **Cognitive Puzzle**.

Ele estabelece **contratos imutáveis** de design, narrativa e leitura de negócio, garantindo que futuras evoluções não deturpem a essência aprovada.

---

## 2. Princípio Central

> **Os ativos visuais são imutáveis. O conteúdo é mutável.**

O sistema não é um dashboard. É uma **interface editorial soberana**, onde:
- a identidade visual não reage a dados;
- os dados se adaptam aos ativos;
- a narrativa do negócio é lida em estados, não em números crus.

---

## 3. Tríade de Estados do Negócio (MVP)

O MVP da Campanha é estruturado sobre **três estados fundamentais**, que representam a leitura mínima e suficiente do negócio:

1. **Movimento (Dia-a-dia)**  
   → Ritmo diário de produção.

2. **Acúmulo (Mês)**  
   → Impacto total acumulado no período.

3. **Temperatura (Campanha)**  
   → Saúde competitiva da campanha.

Nenhum outro eixo é obrigatório nesta fase.

---

## 4. Estados Oficiais da Campanha (Contrato Cognitivo)

A campanha deve ser compreendida **em um olhar**, por usuários simples.

Estados permitidos (exclusivos):

- 🟢 **NO JOGO**
- 🟡 **EM DISPUTA**
- 🔴 **FORA DO RITMO**

Regras:
- Não existem subestados.
- Não existem percentuais expostos como critério primário.
- Todo usuário deve identificar imediatamente: *ganhei? perdi? ainda dá?*

---

## 5. Arquitetura Editorial da Página

A página principal segue **narrativa fixa em 6 seções**, nesta ordem:

1. **Hero Imutável (Capa Editorial)**
2. **Resultado do Dia + Evolução Diária**
3. **Estado da Campanha (Termômetro Radial)**
4. **Bloco de Re-engajamento (Ruptura Visual)**
5. **KPIs Editoriais**
6. **Produção Mensal Acumulada (Fechamento)**

A ordem não é estética, é cognitiva.

---

## 6. Hero — Contrato Visual Imutável

O Hero representa a **identidade do sistema**.

### Componentes fixos:
- **Core Artifact:** Cabeça de puzzle (identidade, não dado).
- **Satélite Esquerdo (Retângulo):** Meta semanal por grupo (A/B/C).
- **Satélite Direito (Círculo):** Total de propostas aprovadas no dia anterior.

### Regras:
- Máximo de **2 satélites visuais**.
- Nenhum satélite cria scroll interno.
- O Hero **não reage a dados**, apenas a:
  - scroll
  - tempo
  - interação leve (drag/parallax)

---

## 7. Ativos de Design (Design Asset Contract)

Ativos são entidades soberanas.

Exemplos:
- Retângulos editoriais
- Círculos / Selos
- Termômetro radial
- Projeções visuais
- Vídeos enquadrados

### Contrato:
- Forma, posição e animação-base são imutáveis.
- Mudanças exigem decisão explícita de produto.
- Dados nunca criam novos ativos — apenas ocupam slots existentes.

---

## 8. Termômetro Radial — Leitura de Temperatura

O termômetro radial **não é um gráfico**, é um **ativo editorial**.

### Função:
- Comunicar estado competitivo da campanha.

### Estrutura:
- Um arco por grupo.
- Preenchimento animado.
- Sem eixos, sem números dominantes.

### Complemento textual:
- Estado da campanha (🟢/🟡/🔴)
- Uma frase de contexto
- Uma ação objetiva ("o que fazer agora")

---

## 9. Inteligência e Responsabilidade

### Princípio:
> **A UI não calcula. A UI consome inteligência.**

- Cálculo de estado ocorre no backend.
- A UI recebe apenas:
  - `status`
  - `nextAction`
  - valores finais

Isso preserva integridade, segurança e clareza.

---

## 10. Papéis no Ecossistema Mycelium

- **Rodrigo (Detentor do Contexto):** Visão, direção e soberania do produto.
- **Jules (Gemini / Mycelium):** Tradução sensorial dos vídeos e intenção visual.
- **Aurora:** Conversão de intenção em contratos, dados e OS executáveis.

Cada papel é exclusivo e não sobreposto.

---

## 11. Encerramento

Este documento sela a transição:

- do Sandbox para o Produto Real;
- do layout para o sistema;
- do dado para o estado;
- da visualização para a decisão.

A **Arquitetura Cognitive Puzzle** está oficialmente instituída.

Qualquer evolução futura deve respeitar este contrato.

---

**FIM DO DOCUMENTO**

