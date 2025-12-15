# 📦 Guia de Deployment — Vercel Blob Publishing

## Visão Geral

Este projeto está configurado para publicar snapshots do dashboard no **Vercel Blob** com proteção por token administrativo. Qualquer dispositivo anônimo pode carregar a versão mais recente publicada.

---

## 🔑 Variáveis de Ambiente Obrigatórias

### `BLOB_READ_WRITE_TOKEN`

- **O que é:** Token de autenticação para acessar Vercel Blob
- **Como obter:**
  1. Acesse https://vercel.com/docs/storage/vercel-blob/using-blob
  2. No seu projeto Vercel, vá a **Settings → Storage**
  3. Se não tiver Blob conectado, clique **"Create Vercel Blob"**
  4. Copie o `BLOB_READ_WRITE_TOKEN` gerado
- **Onde colocar:**
  - Na Vercel: **Settings → Environment Variables → Add Variable**
  - Localmente: criar arquivo `.env.local` (já listado no `.gitignore`)
    ```
    BLOB_READ_WRITE_TOKEN=eyJhbGc...
    ```

### `ADMIN_TOKEN`

- **O que é:** Chave secreta para autorizar publicações
- **Como criar:**
  - Use um gerador de hash (ex.: `openssl rand -hex 32`)
  - Ou crie uma string aleatória forte (mínimo 32 caracteres)
  - Exemplo: `your-secure-admin-token-32-characters-minimum`
- **Onde colocar:**
  - Na Vercel: **Settings → Environment Variables → Add Variable**
  - Localmente: adicionar ao `.env.local`
    ```
    ADMIN_TOKEN=seu-token-super-secreto-aqui
    ```

---

## 📋 Checklist de Deployment

### 1. Preparação Local

- [ ] Clone o repositório
- [ ] Execute `npm install` (ou `pnpm install`)
- [ ] Crie `.env.local` com ambas as variáveis
- [ ] Teste localmente:
  ```bash
  npm run dev
  # Acesse http://localhost:3000/dashboard
  ```

### 2. Deploy no Vercel

- [ ] Conecte o repositório ao Vercel (ou use `vercel` CLI)
- [ ] Em **Settings → Storage**, crie Vercel Blob (se não existir)
- [ ] Copie o `BLOB_READ_WRITE_TOKEN` automáticamente adicionado
- [ ] Adicione manualmente `ADMIN_TOKEN` em **Settings → Environment Variables**
- [ ] Execute novo deploy:
  ```bash
  vercel deploy --prod
  # ou deixe o Vercel fazer deploy automático ao pushar branch
  ```

### 3. Validação Pós-Deploy

#### 3.1 Testar Publicação

```bash
# 1. Abra a página de dashboard
https://seu-projeto.vercel.app/dashboard

# 2. Faça upload do CSV (dados de exemplo)
# Clique em "Publicar versão (Modo Admin)"

# 3. Insira o ADMIN_TOKEN exato
# Clique "Publicar Atualização"

# Esperado: mensagem verde ✅
# "Atualização publicada! Todos verão esta versão."
```

#### 3.2 Testar Carregamento em Incógnito

```bash
# 1. Abra em aba anônima/incógnita (Ctrl+Shift+N ou Cmd+Shift+N)
https://seu-projeto.vercel.app/dashboard

# Esperado: dashboard carrega com dados publicados
# Não deve pedir token
# Banner mostra: "Última atualização: {data e hora}"
```

#### 3.3 Testar Token Inválido

```bash
# 1. Volte à aba normal (cache pode estar vazio)
# 2. Upload do CSV novamente
# 3. Clique "Publicar versão"
# 4. Digite token ERRADO
# 5. Clique "Publicar Atualização"

# Esperado: mensagem vermelha ❌
# "❌ Token inválido. Publicação não autorizada."
```

#### 3.4 Testar Recarregar

```bash
# 1. Em aba incógnita, se dashboard está carregado
# 2. Clique botão azul "Recarregar"

# Esperado: dashboard atualiza com dados mais recentes
# Banner muda de hora se nova publicação foi feita
```

---

## 🛠️ API Endpoints

### `GET /api/latest`

**Sem autenticação** — público

```bash
curl -H "Cache-Control: no-store" \
  https://seu-projeto.vercel.app/api/latest
```

**Resposta se existe snapshot:**
```json
{
  "publishedAt": "2025-01-15T14:32:00Z",
  "sourceFileName": "daily-2025-01-15.csv",
  "version": "1",
  "data": {
    "raw": [...],
    "metrics": {
      "total": 150,
      "approved": 120,
      "weeks": {...},
      "dailyEvolution": [...]
    }
  }
}
```

**Resposta se não existe:**
```
204 No Content
```

---

### `POST /api/publish`

**Requer autenticação** — admin only

```bash
curl -X POST \
  -H "Authorization: Bearer SEU_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "publishedAt": "2025-01-15T14:32:00Z",
    "sourceFileName": "daily-2025-01-15.csv",
    "version": "1",
    "data": { ... }
  }' \
  https://seu-projeto.vercel.app/api/publish
```

**Respostas:**

✅ Sucesso (200):
```json
{
  "success": true,
  "url": "https://your-blob-url.vercel-storage.com/calceleve/latest.json",
  "publishedAt": "2025-01-15T14:32:00Z"
}
```

❌ Token inválido (401):
```json
{
  "error": "Token inválido. Publicação não autorizada."
}
```

❌ Servidor não configurado (500):
```json
{
  "error": "Server misconfigured: ADMIN_TOKEN not set"
}
```

---

## 🔒 Segurança

### O que está protegido?

- ✅ Publicação (`POST /api/publish`) — requer `ADMIN_TOKEN`
- ✅ Leitura (`GET /api/latest`) — aberta (dados públicos, sem sensibilidades)
- ✅ Token não viaja em URL ou querystring
- ✅ Token armazenado apenas em variável de ambiente (nunca no código)

### O que NÃO está protegido?

- ❌ `GET /api/latest` — qualquer pessoa pode ler
- ❌ Dados do dashboard — supostamente públicos/competição
- ❌ Histórico — apenas "latest" é mantido (sem backup)

---

## 🐛 Troubleshooting

### "Erro ao publicar: Token inválido"

- [ ] Verifique que copiou o token exatamente (sem espaços)
- [ ] Confirme que `ADMIN_TOKEN` foi definido em **Environment Variables**
- [ ] Se mudou o token, redeploye: `vercel deploy --prod`

### "Nenhuma atualização publicada ainda"

- [ ] Primeiro upload? Normal — você deve publicar uma vez antes
- [ ] Blob pode estar vazio — tente publicar algo
- [ ] Verifique se `BLOB_READ_WRITE_TOKEN` está ativo

### "404 Not Found em /api/latest"

- [ ] Confirmou deploy após adicionar env vars?
- [ ] Seu projeto tem `/app/api/latest/route.ts`?
- [ ] Se usou Pages Router: arquivo deve estar em `/pages/api/latest.ts`

### Dados não atualizam em aba incógnita

- [ ] Aguarde 2–3 segundos após publicar
- [ ] Clique "Recarregar" botão azul no dashboard
- [ ] Confirme que publicação retornou status 200 ✅
- [ ] Verifique DevTools (Network) para requests bem-sucedidas

---

## 📊 Monitoramento

### Verificar Última Publicação

Acesse diretamente a URL do Blob (gerada após publicação):

```
https://your-blob-url.vercel-storage.com/calceleve/latest.json
```

Verá o JSON completo com data e dados.

### Verificar Logs no Vercel

- Dashboard → seu projeto → **Deployments** → último deploy
- Clique em **Logs** para ver execução e erros

---

## 🚀 Próximos Passos

1. ✅ **Code ready** — projeto está 100% pronto para Vercel Blob
2. 📝 **Você guia o Copilot** — faça deploy no Vercel (env vars, etc.)
3. 🧪 **Teste tudo** — publique, recarregue, valide em incógnito
4. 🎉 **Go live** — dashboard funciona em produção!

---

**Dúvidas?** Volte para análise técnica em [OS-MYCELIUM-CALCELEVE-VERCEL-BLOB-READY-001](../docs/OS.md)
