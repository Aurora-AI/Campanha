import { put, list, head } from '@vercel/blob';

type AnyObj = Record<string, any>;

const PREFIX = 'campanha/snapshots';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

function assertToken() {
  if (!BLOB_TOKEN) throw new Error('Missing BLOB_READ_WRITE_TOKEN');
}

/**
 * Publica um snapshot versionado com URL nao adivinhavel.
 * Nao cria "latest.json" previsivel. O "latest" e calculado via list() no server.
 */
export async function publishSnapshot(snapshot: AnyObj): Promise<void> {
  assertToken();

  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const pathname = `${PREFIX}/snapshot-${stamp}.json`;

  await put(pathname, JSON.stringify(snapshot, null, 2), {
    access: 'public',
    token: BLOB_TOKEN,
    contentType: 'application/json',
    addRandomSuffix: true,
  });
}

/**
 * Busca o snapshot mais recente via list() (server-only, exige token).
 * Retorna null se nao houver nenhum publicado.
 */
export async function getLatestSnapshot(): Promise<AnyObj | null> {
  assertToken();

  const page = await list({
    token: BLOB_TOKEN,
    prefix: `${PREFIX}/`,
    limit: 100,
  });

  const items = page?.blobs ?? [];
  if (items.length === 0) return null;

  const latest = [...items].sort((a, b) => {
    const ta = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const tb = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return tb - ta;
  })[0];

  const meta = await head(latest.pathname, { token: BLOB_TOKEN });
  if (!meta?.url) return null;

  const res = await fetch(meta.url, { cache: 'no-store' });
  if (!res.ok) return null;

  return await res.json();
}
