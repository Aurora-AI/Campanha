# Relatório de Auditoria Visual: Elysian vs. Design Aprovado

**Data:** 18/12/2025
**Alvo:** `https://elysian.ia.br/`
**Referência:** Sandbox "Exo Ape" (Aurora/Campanha)
**Status Geral:** ⚠️ **Conformidade Parcial (Aprox. 40%)**

O site em produção reflete uma versão preliminar ou incompleta da migração. Embora a estrutura macro do Hero esteja presente, a **narrativa editorial de 6 seções** e os **componentes de visualização de dados** (críticos para o projeto) não foram implementados conforme o design aprovado.

---

## 1. Divergências Críticas (Bloqueadores)

### 🔴 Atmosfera e Fundo
*   **Produção:** Fundo branco com textura de "peças de puzzle" (padrão repetitivo).
*   **Aprovado:** Fundo **Branco Puro (`#FFFFFF`)**.
*   **Impacto:** A textura suja o visual e compete com os elementos editoriais, quebrando a premissa de "Exo Ape" (minimalismo extremo).

### 🔴 Seção "Groups" (Ausente)
*   **Produção:** Exibe apenas um card resumo de status.
*   **Aprovado:** Deve conter os **3 Termômetros Radiais (SVG)** com scores de eficiência e o status "Traffic Light" (🟢/🟡/🔴) destacado.
*   **Impacto:** Perda da visualização comparativa entre os grupos, vital para a narrativa de "disputa".

### 🔴 Seção "Reengagement" (Ausente)
*   **Produção:** Inexistente.
*   **Aprovado:** Bloco de ruptura visual (Fundo Preto) com copy imperativo ("Rupture Point").
*   **Impacto:** A narrativa fica monótona sem o ponto de contraste/atenção.

### 🔴 Interatividade do Hero
*   **Produção:** Estático.
*   **Aprovado:** **Mouse-follow ativo** (paralaxe inversa + movimento elástico da imagem central).
*   **Impacto:** O site parece "morto" em comparação à versão viva do sandbox.

---

## 2. Divergências de Conteúdo (Placeholders)

*   **KPIs:** Em produção, exibe apenas textos genéricos ("Slots reservados..."). No design aprovado, temos um grid editorial estruturado com números grandes e deltas.
*   **Total:** Em produção, é apenas um texto placeholder. No aprovado, é uma seção de encerramento com tipografia gigante e barra de progresso.
*   **Seções Extras:** O site atual possui uma seção "Contrato" que não consta no script editorial planejado, diluindo o foco.

---

## 3. Resumo da Estrutura

| Seção | Status em Produção | Ação Necessária |
| :--- | :--- | :--- |
| **1. Hero** | ⚠️ Parcial | Remover textura bg; Ativar Mouse-follow. |
| **2. Yesterday** | ✅ Conforme | Manter (verificar animação chart). |
| **3. Groups** | ❌ **Crítico** | Implementar `SectionGroups.tsx` (Radial). |
| **4. Reengagement** | ❌ **Crítico** | Implementar `SectionReengagement.tsx` (Dark). |
| **5. KPIs** | ⚠️ Skeleton | Substituir por `SectionKPIs.tsx` real. |
| **6. Total** | ⚠️ Skeleton | Substituir por `SectionTotal.tsx` real. |

---

## 4. Plano de Correção (Recomendação)

Para alinhar com o design aprovado sem reescrever código do zero, recomendo **executar a migração fiel** dos arquivos que já estão prontos no sandbox local (`C:\Aurora\Campanha`):

1.  **Copiar Componentes:** Mover a pasta completa `components/sandbox` para `components/campaign` (ou equivalente em produção).
2.  **Copiar Página:** Substituir o conteúdo de `app/page.tsx` pelo conteúdo de `app/sandbox/page.tsx` (ajustando os imports).
3.  **Ligar Dados:** Conectar o `MOCK_DB` (ou API real) para preencher os componentes que hoje estão como placeholders.
4.  **Limpar CSS:** Remover as classes globais que estão inserindo a textura de puzzle no `body`.

---

**Conclusão:** O site atual é um "rascunho estrutural". A versão "Editorial Premium" que construímos no sandbox **não está ativa** em `elysian.ia.br`.
