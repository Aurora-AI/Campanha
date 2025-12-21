import type { Snapshot, StoreMetrics } from '@/lib/analytics/types';

export type StoreSortKey = 'approvedTotal' | 'submittedTotal' | 'approvalRateTotal' | 'approvedYesterday';

export type StoresReportRow = {
  store: string;
  group: string;
  approvedTotal: number;
  submittedTotal: number;
  approvedYesterday: number;
  approvalRateTotalLabel: string;
};

export type StoresReportPayload = {
  updatedAtISO: string;
  query: string;
  sortKey: StoreSortKey;
  rows: StoresReportRow[];
};

type StoreRowInternal = StoresReportRow & { approvalRateTotal: number };

function formatRate(value: number): string {
  if (!Number.isFinite(value)) return '-';
  const pct = Math.round(value * 1000) / 10;
  return `${pct}%`;
}

function normalizeGroup(value: string | null | undefined): string {
  if (value && value.trim()) return value;
  return 'Sem Grupo';
}

function normalizeRow(row: StoreMetrics): StoreRowInternal {
  const approvalRateTotal = row.submittedTotal > 0 ? row.approvedTotal / row.submittedTotal : 0;
  return {
    store: row.store,
    group: normalizeGroup(row.group),
    approvedTotal: row.approvedTotal,
    submittedTotal: row.submittedTotal,
    approvedYesterday: row.approvedYesterday,
    approvalRateTotal,
    approvalRateTotalLabel: formatRate(approvalRateTotal),
  };
}

function matchesQuery(row: StoreMetrics, query: string): boolean {
  if (!query) return true;
  const haystack = `${row.store} ${row.group}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function buildStoresReport(
  snapshot: Snapshot | null | undefined,
  options: { query: string; sortKey: StoreSortKey }
): StoresReportPayload {
  const updatedAtISO = snapshot?.updatedAtISO ?? new Date().toISOString();
  const query = options.query?.trim() ?? '';
  const metrics = snapshot?.storeMetrics ?? [];

  const filtered = metrics.filter((row) => matchesQuery(row, query));
  const rows = filtered.map((row) => normalizeRow(row));

  const sorted = [...rows].sort((a, b) => {
    const key = options.sortKey;
    const av = key === 'approvalRateTotal' ? a.approvalRateTotal : a[key];
    const bv = key === 'approvalRateTotal' ? b.approvalRateTotal : b[key];
    return bv - av;
  });

  return {
    updatedAtISO,
    query,
    sortKey: options.sortKey,
    rows: sorted.map(({ approvalRateTotal: _approvalRateTotal, ...rest }) => rest),
  };
}
