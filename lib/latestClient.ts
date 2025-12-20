// Client-only loader for the public latest snapshot
// Ensures no caching and simple status mapping without throwing

export type LatestSnapshot = Record<string, any>;

export type LatestResult =
  | { status: 'empty' }
  | { status: 'ok'; snapshot: LatestSnapshot };

export async function fetchLatest(): Promise<LatestResult> {
  try {
    const res = await fetch('/api/latest', { cache: 'no-store' });
    if (res.status === 204 || res.status === 404) return { status: 'empty' };
    if (!res.ok) return { status: 'empty' };

    const json = (await res.json()) as unknown;

    if (!json || typeof json !== 'object') {
      return { status: 'empty' };
    }

    return { status: 'ok', snapshot: json as LatestSnapshot };
  } catch (err) {
    console.warn('fetchLatest: error', err);
    return { status: 'empty' };
  }
}
