import { DateTime } from 'luxon';
import { getCampaignConfig } from '@/lib/campaign/config';
import type { Comparative, EditorialSummaryVM, ProposalFact, Snapshot, StoreMetrics } from '@/lib/analytics/types';

function safeDiv(n: number, d: number): number {
  if (!d) return 0;
  return n / d;
}

function pct(n: number): string {
  return `${Math.round(n * 1000) / 10}%`;
}

function pp(n: number): number {
  return Math.round(n * 10) / 10;
}

function pickDateForApproval(p: ProposalFact, useFinalized: boolean): string {
  return useFinalized ? p.finalizedDateISO ?? p.entryDateISO : p.entryDateISO;
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function getDayKeys(tz: string) {
  const now = DateTime.now().setZone(tz);
  const yesterday = now.minus({ days: 1 }).toISODate();
  const dayBefore = now.minus({ days: 2 }).toISODate();
  return { yesterday: yesterday || '', dayBefore: dayBefore || '' };
}

function buildComparatives(
  approvedYesterday: number,
  approvedDayBefore: number,
  submittedYesterday: number,
  submittedDayBefore: number,
  arYesterday: number,
  arDayBefore: number
): Comparative[] {
  const approvedDeltaAbs = approvedYesterday - approvedDayBefore;
  const submittedDeltaAbs = submittedYesterday - submittedDayBefore;

  const approvedDeltaPct = approvedDayBefore ? approvedDeltaAbs / approvedDayBefore : null;
  const submittedDeltaPct = submittedDayBefore ? submittedDeltaAbs / submittedDayBefore : null;

  const approvalRateDeltaPP = pp(arYesterday * 100) - pp(arDayBefore * 100);

  return [
    {
      label: 'DoD',
      approvedDeltaAbs,
      approvedDeltaPct,
      submittedDeltaAbs,
      submittedDeltaPct,
      approvalRateDeltaPP,
    },
  ];
}

export function computeSnapshot(proposals: ProposalFact[]): Snapshot {
  const cfg = getCampaignConfig();
  const tz = cfg.timezone;
  const useFinalized = cfg.useFinalizedDateForApprovals;

  const { yesterday, dayBefore } = getDayKeys(tz);

  const approvedTotal = sum(proposals.map((p) => p.approved));
  const submittedTotal = proposals.length;
  const approvalRateTotal = safeDiv(approvedTotal, submittedTotal);

  const approvedYesterday = sum(
    proposals.filter((p) => pickDateForApproval(p, useFinalized) === yesterday).map((p) => p.approved)
  );

  const approvedDayBefore = sum(
    proposals.filter((p) => pickDateForApproval(p, useFinalized) === dayBefore).map((p) => p.approved)
  );

  const submittedYesterday = proposals.filter((p) => p.entryDateISO === yesterday).length;
  const submittedDayBefore = proposals.filter((p) => p.entryDateISO === dayBefore).length;

  const approvalRateYesterday = safeDiv(approvedYesterday, submittedYesterday);
  const approvalRateDayBefore = safeDiv(approvedDayBefore, submittedDayBefore);

  const byStore = new Map<string, ProposalFact[]>();
  for (const p of proposals) {
    const key = p.store;
    byStore.set(key, [...(byStore.get(key) ?? []), p]);
  }

  const storeMetrics: StoreMetrics[] = Array.from(byStore.entries()).map(([store, arr]) => {
    const group = arr[0]?.group ?? 'Sem Grupo';
    const approvedTotalS = sum(arr.map((p) => p.approved));
    const rejectedTotalS = sum(arr.map((p) => p.rejected));
    const submittedTotalS = arr.length;
    const approvalRateTotalS = safeDiv(approvedTotalS, submittedTotalS);

    const approvedYesterdayS = sum(
      arr.filter((p) => pickDateForApproval(p, useFinalized) === yesterday).map((p) => p.approved)
    );
    const submittedYesterdayS = arr.filter((p) => p.entryDateISO === yesterday).length;
    const approvalRateYesterdayS = safeDiv(approvedYesterdayS, submittedYesterdayS);

    return {
      store,
      group,
      approvedTotal: approvedTotalS,
      rejectedTotal: rejectedTotalS,
      submittedTotal: submittedTotalS,
      approvalRateTotal: approvalRateTotalS,
      approvedYesterday: approvedYesterdayS,
      submittedYesterday: submittedYesterdayS,
      approvalRateYesterday: approvalRateYesterdayS,
    };
  });

  const topApproved = [...storeMetrics].sort((a, b) => b.approvedTotal - a.approvedTotal)[0];
  const topRate = [...storeMetrics].sort((a, b) => b.approvalRateTotal - a.approvalRateTotal)[0];
  const topSubmitted = [...storeMetrics].sort((a, b) => b.submittedTotal - a.submittedTotal)[0];

  const comparatives = buildComparatives(
    approvedYesterday,
    approvedDayBefore,
    submittedYesterday,
    submittedDayBefore,
    approvalRateYesterday,
    approvalRateDayBefore
  );

  const updatedAtISO = new Date().toISOString();

  const editorialSummary: EditorialSummaryVM = {
    updatedAtISO,
    hero: {
      headline: cfg.campaignName,
      subheadline: cfg.taglinePt,
      kpiLabel: 'Aprovacoes (ontem)',
      kpiValue: String(approvedYesterday),
      statusLabel: 'EM DISPUTA',
    },
    pulse: {
      approvedYesterday,
      submittedYesterday,
      approvalRateYesterday,
      dayKeyYesterday: yesterday,
    },
    totals: {
      approved: approvedTotal,
      submitted: submittedTotal,
      approvalRate: approvalRateTotal,
    },
    comparatives,
    highlights: {
      topStoreByApproved: { store: topApproved?.store ?? '-', value: topApproved?.approvedTotal ?? 0 },
      topStoreByApprovalRate: {
        store: topRate?.store ?? '-',
        value: topRate ? Math.round(topRate.approvalRateTotal * 1000) / 10 : 0,
      },
      topStoreBySubmitted: { store: topSubmitted?.store ?? '-', value: topSubmitted?.submittedTotal ?? 0 },
    },
    top3: [
      { rank: 1, name: topApproved?.store ?? '-', value: `${topApproved?.approvedTotal ?? 0} aprov.` },
      { rank: 2, name: topSubmitted?.store ?? '-', value: `${topSubmitted?.submittedTotal ?? 0} digit.` },
      { rank: 3, name: topRate?.store ?? '-', value: pct(topRate?.approvalRateTotal ?? 0) },
    ],
  };

  return {
    schemaVersion: 'campaign-snapshot/v1',
    campaign: {
      campaignId: cfg.campaignId,
      campaignName: cfg.campaignName,
      timezone: cfg.timezone,
    },
    updatedAtISO,
    proposals,
    storeMetrics,
    editorialSummary,
  };
}
