import type { Snapshot, StoreMetrics } from '@/lib/analytics/types';

export type TimelineReportPayload = {
  updatedAtISO: string;
  status: 'ok' | 'empty';
  pulse: {
    approvedYesterday: number;
    submittedYesterday: number;
    approvalRateYesterdayLabel: string;
    dayKeyYesterday: string;
  };
  totals: {
    approved: number;
    submitted: number;
    approvalRateLabel: string;
  };
  topYesterday: Array<{
    store: string;
    group: string;
    approvedYesterday: number;
  }>;
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

function buildTopYesterdayRows(metrics: StoreMetrics[]): Array<{
  store: string;
  group: string;
  approvedYesterday: number;
}> {
  return [...metrics]
    .sort((a, b) => b.approvedYesterday - a.approvedYesterday)
    .slice(0, 10)
    .map((row) => ({
      store: row.store,
      group: normalizeGroup(row.group),
      approvedYesterday: row.approvedYesterday,
    }));
}

export function buildTimelineReport(snapshot: Snapshot | null | undefined): TimelineReportPayload {
  const updatedAtISO = snapshot?.updatedAtISO ?? new Date().toISOString();
  const summary = snapshot?.editorialSummary;

  if (!summary) {
    return {
      updatedAtISO,
      status: 'empty',
      pulse: {
        approvedYesterday: 0,
        submittedYesterday: 0,
        approvalRateYesterdayLabel: '-',
        dayKeyYesterday: '-',
      },
      totals: {
        approved: 0,
        submitted: 0,
        approvalRateLabel: '-',
      },
      topYesterday: [],
    };
  }

  const pulse = summary.pulse ?? {
    approvedYesterday: 0,
    submittedYesterday: 0,
    approvalRateYesterday: 0,
    dayKeyYesterday: '-',
  };

  const totals = summary.totals ?? {
    approved: 0,
    submitted: 0,
    approvalRate: 0,
  };

  return {
    updatedAtISO,
    status: 'ok',
    pulse: {
      approvedYesterday: pulse.approvedYesterday,
      submittedYesterday: pulse.submittedYesterday,
      approvalRateYesterdayLabel: formatRate(pulse.approvalRateYesterday),
      dayKeyYesterday: pulse.dayKeyYesterday,
    },
    totals: {
      approved: totals.approved,
      submitted: totals.submitted,
      approvalRateLabel: formatRate(totals.approvalRate),
    },
    topYesterday: buildTopYesterdayRows(snapshot?.storeMetrics ?? []),
  };
}
