export type ProposalStatus = 'APROVADO' | 'REPROVADO' | 'OUTROS';
export type StatusLabel = 'NO JOGO' | 'EM DISPUTA' | 'FORA DO RITMO';

export type ProposalFact = {
  proposalId: number;
  store: string;
  group: string;
  status: ProposalStatus;
  entryDateISO: string;
  finalizedDateISO: string | null;
  approved: 0 | 1;
  rejected: 0 | 1;
};

export type StoreMetrics = {
  store: string;
  group: string;
  approvedTotal: number;
  rejectedTotal: number;
  submittedTotal: number;
  approvalRateTotal: number;
  approvedYesterday: number;
  submittedYesterday: number;
  approvalRateYesterday: number;
};

export type Comparative = {
  label: 'DoD' | 'WoW' | 'MoM' | 'QoQ' | 'YoY';
  approvedDeltaAbs: number;
  approvedDeltaPct: number | null;
  submittedDeltaAbs: number;
  submittedDeltaPct: number | null;
  approvalRateDeltaPP: number;
};

export type EditorialSummaryVM = {
  updatedAtISO: string;
  hero: {
    headline: string;
    subheadline: string;
    kpiLabel: string;
    kpiValue: string;
    statusLabel: StatusLabel;
  };
  heroCards?: {
    groupResultsYesterday: Array<{ group: string; approvedYesterday: number }>;
    highlightStore: { store: string };
  };
  dailyResult?: {
    approvedYesterday: number;
    targetToday: number;
    dayRatio: number;
    statusLabel: StatusLabel;
  };
  storeResultsYesterday?: Array<{
    store: string;
    group: string;
    approvedYesterday: number;
    targetToday: number;
    dayRatio: number;
  }>;
  campaignTrend?: {
    points: Array<{
      dayKey: string;
      label: string;
      approved: number;
      target: number;
      trend: number;
    }>;
  };
  weeklyTrend?: {
    targetToday: number;
    points: Array<{ dayKey: string; label: string; approved: number }>;
  };
  dailyEditorial?: {
    title: string;
    body: string;
    statusLabel: StatusLabel;
    subject: string;
    dayKeyYesterday: string;
  };
  weeklyEditorial?: {
    title: string;
    body: string;
    weekLabel: string;
    highlightName: string;
  };
  pulse: {
    approvedYesterday: number;
    submittedYesterday: number;
    approvalRateYesterday: number;
    dayKeyYesterday: string;
  };
  totals: {
    approved: number;
    submitted: number;
    approvalRate: number;
  };
  comparatives: Comparative[];
  highlights: {
    topStoreByApproved: { store: string; value: number };
    topStoreByApprovalRate: { store: string; value: number };
    topStoreBySubmitted: { store: string; value: number };
  };
  top3: Array<{ rank: 1 | 2 | 3; name: string; value: string }>;
};

export type Snapshot = {
  schemaVersion: 'campaign-snapshot/v1';
  campaign: {
    campaignId: string;
    campaignName: string;
    timezone: string;
  };
  updatedAtISO: string;
  proposals: ProposalFact[];
  storeMetrics: StoreMetrics[];
  editorialSummary: EditorialSummaryVM;
};
