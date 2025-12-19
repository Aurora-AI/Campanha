# 📦 RELEASE NOTES

## Frontend v1.0 — *Exo Ape Clone*

**Projeto:** Campanha Calceleve  
**Arquitetura:** Cognitive Puzzle / Editorial-First  
**Data:** 19/12/2025  
**Status:** 🟢 **APROVADO PARA DEPLOY**

---

## 🎯 Visão Geral

Esta versão marca a **finalização oficial do Frontend v1.0** da Campanha Calceleve, com foco em:

* Experiência editorial premium (inspirada em Exo Ape / Awwwards)
* Hierarquia visual soberana
* Responsividade intencional (não adaptativa por remendo)
* Separação rígida entre **visual imutável** e **conteúdo mutável**

A interface deixa de ser um “dashboard tradicional” e passa a operar como **organismo visual editorial**, preparado para ingestão de dados reais via backend.

---

## ✨ Principais Destaques

### 🧠 Hero “Glass Parallax” (Contrato Visual Imutável)

* Hero reconstruído como **bloco único e soberano**
* Fundo composto exclusivamente pela imagem `puzzle.png`
* Parallax invertido sutil (mouse-follow), criando profundidade
* Camada frontal com texto em “vidro invisível”:

  * 100% transparente
  * Glow branco suave para leitura e sofisticação
* Texto oficial definido:

  * **Título:** *Calceleve — Campanha Aceleração 2025*
  * **Subtítulo:** *EVOLUÇÃO DIÁRIA E INSIGHTS ESTRATÉGICOS PARA A ERA MODERNA.*

🔒 **Status:** Congelado. Nenhuma modificação estrutural permitida a partir desta versão.

---

### 🛰️ Satélites Editoriais (Weekly Goals / 142)

* Posicionamento refinado em **órbita editorial**
* Hierarquia clara: Núcleo (Hero) → Satélites
* Safe-area respeitada (sem colisão com bordas ou título)
* Comportamento responsivo:

  * **Desktop / Tablet:** ambos ativos
  * **Mobile:** Weekly Goals ocultado; indicador **142** mantido, legível e elegante

---

### 📱 Responsividade Validada

* Desktop: composição íntegra e equilibrada
* Tablet: comportamento coerente por continuidade lógica
* Mobile:

  * Ocultação limpa de elementos não-críticos
  * Nenhum scroll horizontal
  * Sem quebras, overlaps ou espaços fantasmas

---

### 🧩 Governança Técnica (Trustware)

* Guard de Frontend ativo e endurecido:

  * UI **não executa lógica de negócio**
  * Matemática permitida apenas para **UI Physics** (parallax, easing)
* ViewModels isolados para cálculo (quando aplicável)
* Arquivos legados neutralizados (_legacy / .bak)

---

### 📊 Observabilidade

* **Vercel Speed Insights** integrado ao layout raiz
* Telemetria real de performance habilitada (RUM)
* Base pronta para acompanhamento pós-deploy

---

## ⚠️ Limitações Conhecidas (Não-Bloqueantes)

* Backend (Elysian Brain) pode apresentar *cold start* ou indisponibilidade temporária.
* Em caso de backend offline, o frontend pode exibir estados de erro momentâneos.
* Este comportamento **não invalida** o Frontend v1.0.

---

## ✅ Critérios de Aceite (Concluídos)

* [x] Integridade visual preservada em todos os breakpoints
* [x] Hero imutável definido e congelado
* [x] Satélites refinados e responsivos
* [x] Nenhuma regressão de layout
* [x] Frontend pronto para ingestão de dados reais

---

## 🚀 Próximos Passos Planejados

1. **Integração de dados reais (Backend / Function Gemma)**

   * Injeção dos números finais da campanha
   * Estados de loading, sucesso e erro controlados
2. Expansão do site com:

   * Demais seções editoriais
   * Narrativa completa da campanha
3. Hardening final para apresentação ao cliente

---

## 🟢 Conclusão

O **Frontend v1.0 — Exo Ape Clone** está oficialmente **concluído, aprovado e pronto para deploy**.

A partir deste ponto:

* O visual está congelado.
* Apenas dados e conteúdo serão integrados.
* O risco de regressão é mínimo.

---

### ✅ Próxima ação imediata

Agora podemos **trazer os números reais para o site** com segurança.

👉 **Envie os números da campanha** (ou diga o formato: CSV, JSON, texto), que eu já preparo:

* o ViewModel correto,
* o mapeamento visual,
* e a injeção sem tocar no Hero.

Estamos no tempo certo para o cliente.
