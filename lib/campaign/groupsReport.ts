import type { Snapshot, StoreMetrics } from '@/lib/analytics/types';
import { extractStoreCode, groupByStoreCode } from '@/lib/analytics/campaignTargets';
import { groupLabelFromKey } from '@/lib/campaign/groupIdentity';

export type GroupsReportStore = {
  store: string;
  group: string;
  groupLabel: string;
  approvedTotal: number;
  submittedTotal: number;
  approvedYesterday: number;
  approvalRateTotalLabel: string;
};

export type GroupsReportItem = {
  group: string;
  groupLabel: string;
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

function groupKeyFromStore(store: string | null | undefined): string {
  const storeCode = extractStoreCode(store ?? '');
  if (storeCode == null) return 'OUTROS';
  return groupByStoreCode[storeCode] ?? 'OUTROS';
}

function buildStoreRow(row: StoreMetrics): GroupsReportStore {
  const approvalRateTotal = row.submittedTotal > 0 ? row.approvedTotal / row.submittedTotal : 0;
  const group = groupKeyFromStore(row.store);
  return {
    store: row.store,
    group,
    groupLabel: groupLabelFromKey(group),
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
    const group = groupKeyFromStore(row.store);
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
      groupLabel: groupLabelFromKey(group),
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
