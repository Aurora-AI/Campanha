import { head, put } from '@vercel/blob';
import type { Snapshot } from '@/lib/analytics/types';
import { getBlobToken } from '@/lib/publisher';

const PREFIX = 'campanha/monthly';
const INDEX_PATH = `${PREFIX}/index.json`;

export type MonthlySnapshotPayload = {
  schemaVersion: 'campaign-monthly-snapshot/v1';
  meta: {
    year: number;
    month: number;
    uploadedAtISO: string;
    sourceFileName: string;
    audit?: MonthlyAudit;
  };
  snapshot: Snapshot;
};

export type MonthlyAudit = {
  monthKey: string;
  canonicalMonthField: {
    key: string;
    strategy: 'keyword_match' | 'statistical_fallback' | 'default';
  };
  totalRows: number;
  invalidCadastroDateRows: number;
  spillover: {
    finalizedOutsideMonthCount: number;
  };
};

export type MonthlyIndex = {
  schemaVersion: 'campaign-monthly-index/v1';
  updatedAtISO: string;
  months: Array<{
    year: number;
    month: number;
    source: string;
    uploadedAtISO: string;
    pathname: string;
    audit?: MonthlyAudit;
  }>;
  current?: { year: number; month: number };
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function ymPath(year: number, month: number): string {
  return `${PREFIX}/${year}-${pad2(month)}.json`;
}

async function safeHead(pathname: string) {
  try {
    const token = getBlobToken();
    return token ? await head(pathname, { token }) : await head(pathname);
  } catch {
    return null;
  }
}

async function fetchJson(url: string): Promise<unknown> {
  const u = new URL(url);
  u.searchParams.set('t', String(Date.now()));
  const res = await fetch(u.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function loadMonthlyIndex(): Promise<MonthlyIndex | null> {
  const meta = await safeHead(INDEX_PATH);
  if (!meta?.url) return null;
  try {
    const json = await fetchJson(meta.url);
    if (!json || typeof json !== 'object') return null;
    const rec = json as Record<string, unknown>;
    if (rec.schemaVersion !== 'campaign-monthly-index/v1') return null;
    return rec as MonthlyIndex;
  } catch {
    return null;
  }
}

export async function loadMonthlySnapshot(year: number, month: number): Promise<MonthlySnapshotPayload | null> {
  const path = ymPath(year, month);
  const meta = await safeHead(path);
  if (!meta?.url) return null;
  try {
    const json = await fetchJson(meta.url);
    if (!json || typeof json !== 'object') return null;
    const rec = json as Record<string, unknown>;
    if (rec.schemaVersion !== 'campaign-monthly-snapshot/v1') return null;
    return rec as MonthlySnapshotPayload;
  } catch {
    return null;
  }
}

export async function publishMonthlySnapshot(args: {
  year: number;
  month: number;
  sourceFileName: string;
  snapshot: Snapshot;
  audit?: MonthlyAudit;
  allowOverwrite?: boolean;
}): Promise<MonthlyIndex> {
  const token = getBlobToken();
  if (!token) throw new Error('Missing BLOB_READ_WRITE_TOKEN');

  const nowISO = new Date().toISOString();
  const pathname = ymPath(args.year, args.month);

  const payload: MonthlySnapshotPayload = {
    schemaVersion: 'campaign-monthly-snapshot/v1',
    meta: {
      year: args.year,
      month: args.month,
      uploadedAtISO: nowISO,
      sourceFileName: args.sourceFileName,
      ...(args.audit ? { audit: args.audit } : {}),
    },
    snapshot: args.snapshot,
  };

  await put(pathname, JSON.stringify(payload, null, 2), {
    access: 'public',
    token,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: args.allowOverwrite ?? false,
  });

  const existing = (await loadMonthlyIndex()) ?? {
    schemaVersion: 'campaign-monthly-index/v1',
    updatedAtISO: nowISO,
    months: [],
    current: { year: args.year, month: args.month },
  };

  const months = [...(existing.months ?? [])].filter((m) => !(m.year === args.year && m.month === args.month));
  months.push({
    year: args.year,
    month: args.month,
    source: args.sourceFileName,
    uploadedAtISO: nowISO,
    pathname,
    ...(args.audit ? { audit: args.audit } : {}),
  });

  months.sort((a, b) => (a.year - b.year) || (a.month - b.month));

  const next: MonthlyIndex = {
    schemaVersion: 'campaign-monthly-index/v1',
    updatedAtISO: nowISO,
    months,
    current: { year: args.year, month: args.month },
  };

  await put(INDEX_PATH, JSON.stringify(next, null, 2), {
    access: 'public',
    token,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return next;
}
