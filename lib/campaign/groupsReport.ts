import type { Snapshot, StoreMetrics } from '@/lib/analytics/types';

export type GroupsReportStore = {
  store: string;
  group: string;
  approvedTotal: number;
  submittedTotal: number;
  approvedYesterday: number;
  approvalRateTotalLabel: string;
};

export type GroupsReportItem = {
  group: string;
  approvedTotal: number;
  submittedTotal: number;
  approvedYesterday: number;
  approvalRateTotalLabel: string;
  stores: GroupsReportStore[];
};

export type GroupsReportPayload = {
  updatedAtISO: string;
  groups: GroupsReportItem[];
};

function formatRate(value: number): string {
  if (!Number.isFinite(value)) return '-';
  const pct = Math.round(value * 1000) / 10;
  return `${pct}%`;
}

function normalizeGroup(value: string | null | undefined): string {
  if (value && value.trim()) return value;
  return 'Sem Grupo';
}

function buildStoreRow(row: StoreMetrics): GroupsReportStore {
  const approvalRateTotal = row.submittedTotal > 0 ? row.approvedTotal / row.submittedTotal : 0;
  return {
    store: row.store,
    group: normalizeGroup(row.group),
    approvedTotal: row.approvedTotal,
    submittedTotal: row.submittedTotal,
    approvedYesterday: row.approvedYesterday,
    approvalRateTotalLabel: formatRate(approvalRateTotal),
  };
}

export function buildGroupsReport(snapshot: Snapshot | null | undefined): GroupsReportPayload {
  const updatedAtISO = snapshot?.updatedAtISO ?? new Date().toISOString();
  const metrics = snapshot?.storeMetrics ?? [];
  const grouped = new Map<string, StoreMetrics[]>();

  for (const row of metrics) {
    const group = normalizeGroup(row.group);
    const list = grouped.get(group) ?? [];
    list.push({ ...row, group });
    grouped.set(group, list);
  }

  const groups: GroupsReportItem[] = [];

  for (const [group, stores] of grouped.entries()) {
    let approvedTotal = 0;
    let submittedTotal = 0;
    let approvedYesterday = 0;

    for (const store of stores) {
      approvedTotal += store.approvedTotal;
      submittedTotal += store.submittedTotal;
      approvedYesterday += store.approvedYesterday;
    }

    const approvalRateTotal = submittedTotal > 0 ? approvedTotal / submittedTotal : 0;
    const storeRows = stores
      .map((store) => buildStoreRow(store))
      .sort((a, b) => b.approvedTotal - a.approvedTotal);

    groups.push({
      group,
      approvedTotal,
      submittedTotal,
      approvedYesterday,
      approvalRateTotalLabel: formatRate(approvalRateTotal),
      stores: storeRows,
    });
  }

  groups.sort((a, b) => b.approvedTotal - a.approvedTotal);

  return { updatedAtISO, groups };
}
