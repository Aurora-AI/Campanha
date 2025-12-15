# Dashboard Calceleve - Campanha Aceleração 2025

Dashboard de apuração semanal de metas por grupos com publicação via Vercel Blob.

## Features

- ✅ Upload e processamento de CSV diário
- ✅ Métricas semanais (Seg-Dom) com estágios de campanha
- ✅ Grupos com metas agregadas e ranking Top 3
- ✅ Elegibilidade automática (grupo + loja)
- ✅ **Publicação pública via Vercel Blob**
- ✅ Sincronização automática entre dispositivos
- ✅ Persistência IndexedDB + localStorage

## Publicação e Sincronização

Qualquer pessoa com o link **sempre vê a última versão publicada**.

### Como Publicar

1. Acesse `/dashboard`
2. Faça upload do CSV
3. Clique em "Publicar versão (Modo Admin)"
4. Insira o **Token de Publicação** (ADMIN_TOKEN)
5. Clique em "Publicar Atualização"
6. Pronto! Todos que acessarem verão esta versão

### Como Visualizar

1. Acesse `/dashboard` em qualquer dispositivo
2. Dashboard carrega automaticamente a última versão
3. Clique em "Recarregar" para atualizar

📖 **Documentação completa:** [docs/BLOB_PUBLISH.md](docs/BLOB_PUBLISH.md)

## Configuração

### Environment Variables

Crie `.env.local`:

```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
ADMIN_TOKEN=your_secure_random_token
```

### Development

```bash
npm install
npm run dev
```

### Production (Vercel)

1. Conecte Blob Store "AURORA" ao projeto
2. Configure env vars: `BLOB_READ_WRITE_TOKEN` e `ADMIN_TOKEN`
3. Deploy

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Vercel Blob
- IndexedDB + localStorage

## Estrutura

```
app/
  api/
    publish/        # POST - Publica snapshot
    latest/         # GET - Busca última versão
  dashboard/
components/
  Dashboard.tsx     # Upload + Publicação
  GroupPerformance.tsx
  KPICards.tsx
lib/
  pipeline.ts       # Processamento CSV
  publisher.ts      # Client Blob API
  storage.ts        # IndexedDB wrapper
  storage/
    indexedDb.ts    # Robust IndexedDB schema
```

## License

MIT
