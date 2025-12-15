# Publicação via Vercel Blob

## Configuração de Environment Variables

### 1. No Vercel Dashboard

Acesse Settings → Environment Variables e adicione:

#### `BLOB_READ_WRITE_TOKEN`
- **Valor:** Token do Vercel Blob Store "AURORA"
- **Gerado automaticamente** ao conectar o Blob Store ao projeto
- **Escopo:** Production, Preview, Development

#### `ADMIN_TOKEN`
- **Valor:** String aleatória longa (ex: `openssl rand -hex 32`)
- **Propósito:** Autorização para publicar snapshots
- **Escopo:** Production, Preview
- **Exemplo:** `7a8f9e2c4b1d6e3a5c9f8b7e4d2a6c8f1b9e7d5c3a8f6e4b2d7c9a5e3f1b8d6`

### 2. Desenvolvimento Local

Crie `.env.local`:

```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
ADMIN_TOKEN=your_secure_random_token
```

**Nunca commite `.env.local`** (já está no `.gitignore`)

## Como Funciona

### Fluxo de Publicação

1. **Upload do CSV** → Dashboard processa e mostra resultados
2. **Modo Admin** → Usuário clica em "Publicar versão (Modo Admin)"
3. **Token de Publicação** → Insere o `ADMIN_TOKEN` no campo
4. **Publica** → API valida token e salva `calceleve/latest.json` no Blob
5. **Confirmação** → "Atualização publicada! Todos verão esta versão."

### Fluxo de Leitura

1. Qualquer pessoa acessa `/dashboard`
2. Dashboard automaticamente busca `GET /api/latest`
3. Se existe `latest.json` → carrega snapshot público
4. Se não existe → mostra "Nenhuma atualização publicada ainda"
5. **Botão "Recarregar"** → refaz busca para pegar última versão

## Endpoints

### `POST /api/publish`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "publishedAt": "2025-12-15T10:30:00.000Z",
  "sourceFileName": "relatorio.csv",
  "version": "1",
  "data": { /* DashboardData */ }
}
```

**Responses:**
- `200` → `{ success: true, url: "...", publishedAt: "..." }`
- `401` → `{ error: "Token inválido. Publicação não autorizada." }`
- `400` → `{ error: "Snapshot inválido" }`

### `GET /api/latest`

**Headers:** Nenhum (público)

**Responses:**
- `200` → JSON do snapshot
- `204 No Content` → Ainda não foi publicado
- `500` → Erro

**Cache:** Nenhum (`no-store, no-cache`)

## Segurança

✅ **ADMIN_TOKEN nunca é exposto no client**  
✅ **Publicação protegida por Bearer token**  
✅ **Snapshot público pode ser lido por qualquer pessoa** (intencional)  
✅ **Sobrescreve sempre o mesmo arquivo** (`calceleve/latest.json`)

## Troubleshooting

### "Token inválido"
- Verificar se `ADMIN_TOKEN` está setado no Vercel
- Confirmar que o valor digitado bate exatamente com a env var
- Redeployar após mudar env vars

### "Nenhuma atualização publicada"
- Primeira vez: é esperado, precisa publicar via modo admin
- Verificar se `BLOB_READ_WRITE_TOKEN` está correto
- Conferir logs da API no Vercel

### Snapshot não atualiza
- Apertar botão "Recarregar" (cache pode estar ativo localmente)
- Verificar se publicação teve sucesso (status verde)
- Conferir Blob Store no Vercel Dashboard → Blob → `calceleve/latest.json`

## Snapshot Structure

```typescript
interface PublicSnapshot {
  publishedAt: string;        // ISO timestamp
  sourceFileName?: string;    // Nome do CSV original
  version: string;            // "1"
  data: DashboardData;        // Dados completos do dashboard
}
```

## Deploy Checklist

- [ ] Blob Store conectado ao projeto Vercel
- [ ] `BLOB_READ_WRITE_TOKEN` configurado
- [ ] `ADMIN_TOKEN` gerado e configurado
- [ ] Build passa sem erros
- [ ] Deploy na Vercel
- [ ] Testar publicação com token correto
- [ ] Testar acesso público (aba anônima)
- [ ] Testar recarregamento
