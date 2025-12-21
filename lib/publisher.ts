import { put, list, head } from '@vercel/blob';
import type { UnknownRecord } from '@/src/types/data';

export type MetricsPublisher = {
  publishMetrics: (snapshot: UnknownRecord) => Promise<void>;
};

const PREFIX = 'campanha/snapshots';

export function getBlobToken(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || token.trim().length === 0) return null;
  return token;
}

function assertToken(): string {
  const token = getBlobToken();
  if (!token) throw new Error('Missing BLOB_READ_WRITE_TOKEN');
  return token;
}

export function createBlobPublisher(): MetricsPublisher {
  return {
    publishMetrics: publishSnapshot,
  };
}

export function createNoopPublisher(): MetricsPublisher {
  return {
    publishMetrics: async () => undefined,
  };
}

/**
 * Publica um snapshot versionado com URL nao adivinhavel.
 * Nao cria "latest.json" previsivel. O "latest" e calculado via list() no server.
 */
export async function publishSnapshot(snapshot: UnknownRecord): Promise<void> {
  const token = assertToken();

  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const pathname = `${PREFIX}/snapshot-${stamp}.json`;

  await put(pathname, JSON.stringify(snapshot, null, 2), {
    access: 'public',
    token,
    contentType: 'application/json',
    addRandomSuffix: true,
  });
}

/**
 * Busca o snapshot mais recente via list() (server-only, exige token).
 * Retorna null se nao houver nenhum publicado.
 */
export async function getLatestSnapshot(): Promise<UnknownRecord | null> {
  const token = assertToken();

  const page = await list({
    token,
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

  const meta = await head(latest.pathname, { token });
  if (!meta?.url) return null;

  const res = await fetch(meta.url, { cache: 'no-store' });
  if (!res.ok) return null;

  return await res.json();
}
