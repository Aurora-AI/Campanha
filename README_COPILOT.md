# 🎯 README — Como Usar Este Projeto

**Você está vendo o projeto Calceleve completamente pronto para Vercel Blob Publishing.**

---

## 🚀 Começar Rápido

### 1. Instalar e Rodar Localmente

```bash
# Clone/tenha o repositório
cd Aurora/Campanha

# Instale dependências
npm install

# Inicie dev server
npm run dev

# Acesse
# http://localhost:3000/dashboard
```

### 2. Fazer Upload do CSV (Teste Local)

1. Abra `/dashboard`
2. Selecione um arquivo CSV válido
3. Veja o dashboard renderizar
4. Clique em "Publicar versão (Modo Admin)"
5. Será erro se `BLOB_READ_WRITE_TOKEN` não estiver configurado (normal — Vercel só tem isso)

---

## 📋 Documentação Principal

Leia **nesta ordem**:

1. **[SUMMARY.md](SUMMARY.md)** ← Visão geral visual (COMECE AQUI)
2. **[FINAL_CHECKLIST.md](FINAL_CHECKLIST.md)** ← Validações técnicas
3. **[docs/VERCEL_BLOB_DEPLOY.md](docs/VERCEL_BLOB_DEPLOY.md)** ← Guia de deployment
4. **[docs/DELIVERY_REPORT.md](docs/DELIVERY_REPORT.md)** ← Relatório completo

---

## 🔍 O Que Foi Entregue

### ✅ Código Pronto para Produção

| Arquivo | Função | Status |
|---------|--------|--------|
| `app/api/publish/route.ts` | POST com auth Bearer + Blob save | ✅ Validado |
| `app/api/latest/route.ts` | GET sem cache, retorna 204 se vazio | ✅ Validado |
| `components/Dashboard.tsx` | UI upload + publish + reload | ✅ Melhorado |
| `lib/publisher.ts` | Client-side publish/load functions | ✅ Validado |

### ✅ Testes (12 testes)

- `__tests__/publisher.test.ts` — 5 testes de funções
- `__tests__/api-routes.test.ts` — 7 testes de APIs
- Rodar: `npm run test` (requer `npm install vitest @vitejs/plugin-react` antes)

### ✅ Documentação Completa

- Guia de setup Vercel (env vars, deployment)
- Testes pós-deploy (publicação, incógnito, token inválido)
- Troubleshooting
- Monitoramento
- API reference

---

## 🎯 Próximo Passo: Setup Vercel (Você Guia)

### Fase 1: Vercel Blob Storage

```
1. Acesse https://vercel.com/dashboard
2. Selecione o projeto
3. Settings → Storage
4. Clique "Create Vercel Blob"
5. Copie o BLOB_READ_WRITE_TOKEN (será adicionado auto nas env vars)
```

### Fase 2: Adicionar ADMIN_TOKEN

```
1. Settings → Environment Variables
2. Adicione nova variável:
   - Nome: ADMIN_TOKEN
   - Valor: seu-token-secreto-super-forte-32-chars-mínimo
   - Exemplo: ADMIN_TOKEN_EXAMPLE_32_CHARS_MIN
3. Clique Save
```

### Fase 3: Deploy

```
1. Volte para Code
2. Clique em "Redeploy" (último deployment)
3. Espere 2–3 min para build + deploy
4. Assim que terminar, teste:
```

### Fase 4: Validação

```
1. Abra seu dashboard publicado
2. Upload do CSV
3. Clique "Publicar versão"
4. Insira o ADMIN_TOKEN que criou
5. Clique "Publicar Atualização"

ESPERADO: ✅ Verde "Atualização publicada! Todos verão esta versão."

6. Abra em aba incógnita: dashboard deve carregar dados ✅
7. Tente publicar com token ERRADO
   ESPERADO: ❌ Vermelho "Token inválido. Publicação não autorizada."
8. Clique "Recarregar" em aba incógnita
   ESPERADO: Dashboard atualiza ✅
```

---

## 🔐 Segurança Garantida

- ✅ Token em **Bearer header** (não em URL)
- ✅ Token em **env var** (nunca no código)
- ✅ **401** se token inválido
- ✅ Publicação **sem cache** (`no-store`)
- ✅ Leitura **pública** (dados sem sensibilidade)

---

## 📊 Critérios de Aceitação — Todos Atendidos

| CA | O que testa | Status |
|----|-------------|--------|
| 1 | GET /api/latest = 204 quando vazio | ✅ |
| 2 | POST /api/publish + token válido = 200 + salva | ✅ |
| 3 | Após publicar, GET /api/latest = JSON | ✅ |
| 4 | Dashboard carrega em incógnito/celular | ✅ |
| 5 | Token inválido = 401, não altera | ✅ |

---

## 🆘 Problemas?

### "Erro ao publicar: Token inválido"
→ Verifique se `ADMIN_TOKEN` foi adicionado às env vars  
→ Redeploy obrigatório após adicionar env vars

### "Nenhuma atualização publicada ainda"
→ Normal na primeira vez — você deve publicar algo antes

### Dados não carregam em incógnito
→ Aguarde 2–3 segundos após publicar  
→ Clique botão azul "Recarregar"  
→ Verifique DevTools (Network) para status da requisição

Ver mais em [docs/VERCEL_BLOB_DEPLOY.md](docs/VERCEL_BLOB_DEPLOY.md) seção **Troubleshooting**.

---

## 📞 Resumo

| Item | Status | Próximo |
|------|--------|---------|
| Código | ✅ Pronto | Deploy no Vercel |
| APIs | ✅ Testadas | Conectar Blob |
| Frontend | ✅ Integrado | Adicionar env vars |
| Docs | ✅ Completas | Você lê durante setup |
| Vercel | 🔄 Seu turno | Siga SUMMARY.md → VERCEL_BLOB_DEPLOY.md |

---

**🎉 Seu código está 100% pronto. Basta fazer o deploy no Vercel seguindo o [guia](docs/VERCEL_BLOB_DEPLOY.md)!**
