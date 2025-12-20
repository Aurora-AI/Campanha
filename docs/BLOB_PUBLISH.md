# Publicação via Vercel Blob (Snapshots Unguessable)

## Configuração de Environment Variables

### 1. No Vercel Dashboard

Acesse Settings → Environment Variables e adicione:

#### `BLOB_READ_WRITE_TOKEN`
- **Valor:** Token do Vercel Blob Store "AURORA"
- **Gerado automaticamente** ao conectar o Blob Store ao projeto
- **Escopo:** Production, Preview, Development

#### `ADMIN_TOKEN`
- **Valor:** String aleatoria longa (ex: `openssl rand -hex 32`)
- **Proposito:** Autorizacao para publicar snapshots
- **Escopo:** Production, Preview
- **Exemplo:** `7a8f9e2c4b1d6e3a5c9f8b7e4d2a6c8f1b9e7d5c3a8f6e4b2d7c9a5e3f1b8d6`

### 2. Desenvolvimento Local

Crie `.env.local`:

```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
ADMIN_TOKEN=your_secure_random_token
```

**Nunca commite `.env.local`** (ja esta no `.gitignore`)

## Como Funciona

### Fluxo de Publicacao

1. **Upload do CSV** via `/admin`
2. **Token de Publicacao** → insere o `ADMIN_TOKEN`
3. **Publica** → API valida token, processa CSV, gera snapshot e grava Blob com `addRandomSuffix: true`
4. **Confirmacao** → resposta retorna `ok: true` (sem URL)

### Fluxo de Leitura

1. O app chama `GET /api/latest`
2. O server resolve o snapshot mais recente via `list()` + token
3. O JSON completo e servido apenas pela API (sem expor URL do Blob)
4. Em prod sem publicacao → retorna `404` com erro claro

## Endpoints

### `POST /api/publish-csv`

**Headers:**
```
x-admin-token: <ADMIN_TOKEN>
```

**Body:** `multipart/form-data`
- `file`: CSV original

**Responses:**
- `200` → `{ ok: true, proposals: number }`
- `401` → `{ error: "UNAUTHORIZED" }`
- `400` → `{ error: "MISSING_FILE" }`

### `GET /api/latest`

**Headers:** Nenhum (protegido por Cloudflare Access em prod)

**Responses:**
- `200` → JSON do snapshot
- `404` → Nenhum snapshot publicado (prod)
- `500` → Erro interno

## Seguranca

✅ **ADMIN_TOKEN nunca e exposto no client**  
✅ **Snapshots com URLs nao adivinhaveis** (`addRandomSuffix: true`)  
✅ **Sem `latest.json` previsivel**  
✅ **Leitura somente via `/api/latest` (server-side)**  

## Troubleshooting

### "UNAUTHORIZED"
- Verificar se `ADMIN_TOKEN` esta setado no Vercel
- Confirmar que o valor digitado bate exatamente com a env var
- Redeployar apos mudar env vars

### "NO_SNAPSHOT"
- Primeira vez: e esperado, precisa publicar via `/admin`
- Verificar se `BLOB_READ_WRITE_TOKEN` esta correto
- Conferir logs da API no Vercel

### Snapshot nao atualiza
- Conferir resposta do `/api/publish-csv`
- Verificar logs da API no Vercel
- Conferir Blob Store no Vercel Dashboard → Blob → `campanha/snapshots/*`

## Snapshot Structure

```ts
interface Snapshot {
  schemaVersion: 'campaign-snapshot/v1';
  campaign: {
    campaignId: string;
    campaignName: string;
    timezone: string;
  };
  updatedAtISO: string;
  proposals: ProposalFact[];
  storeMetrics: StoreMetrics[];
  editorialSummary: EditorialSummaryVM;
}
```

## Deploy Checklist

- [ ] Blob Store conectado ao projeto Vercel
- [ ] `BLOB_READ_WRITE_TOKEN` configurado
- [ ] `ADMIN_TOKEN` gerado e configurado
- [ ] Build passa sem erros
- [ ] Deploy na Vercel
- [ ] Testar publicacao via `/admin`
- [ ] Testar `GET /api/latest`
