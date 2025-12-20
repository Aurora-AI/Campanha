import type { Snapshot } from '@/lib/analytics/types';

export async function getLatestSnapshot(): Promise<Snapshot | null> {
  try {
    const res = await fetch('/api/latest', { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Snapshot;
  } catch {
    return null;
  }
}
