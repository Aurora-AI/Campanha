import { describe, it, expect, vi } from 'vitest';

const getLatestSnapshotMock = vi.fn().mockResolvedValue(null);
vi.mock('@/lib/publisher', () => ({
  getLatestSnapshot: getLatestSnapshotMock,
}));

const loadMonthlyIndexMock = vi.fn();
const loadMonthlySnapshotMock = vi.fn();

vi.mock('@/lib/server/monthlySnapshots', () => ({
  loadMonthlyIndex: loadMonthlyIndexMock,
  loadMonthlySnapshot: loadMonthlySnapshotMock,
}));

describe('getHomeViewModel', () => {
  it('não inventa baseline quando ausente', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2025-12-15T15:00:00.000Z')); // 12:00 em São Paulo

      loadMonthlyIndexMock.mockResolvedValueOnce({
        schemaVersion: 'campaign-monthly-index/v1',
        updatedAtISO: '2025-12-10T00:00:00.000Z',
        months: [],
      });

      const { getHomeViewModel } = await import('@/lib/server/homeViewModel');
      const vm = await getHomeViewModel();

      expect(vm.dataCoverage.liveMonth?.year).toBe(2025);
      expect(vm.dataCoverage.liveMonth?.month).toBe(12);
      expect(vm.dataCoverage.baselineMonthLoaded).toBeUndefined();
      expect(vm.dataCoverage.previousMonthLoaded).toBeUndefined();

      expect(vm.trendComparative.metrics.proposals[0]?.baselineValue).toBeNull();
      expect(vm.trendComparative.summary?.proposals?.baselineTotal).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('infere mês corrente a partir do snapshot publicado (evita acumulado por loja zerado)', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-02-02T15:00:00.000Z')); // 12:00 em São Paulo

      loadMonthlyIndexMock.mockResolvedValueOnce({
        schemaVersion: 'campaign-monthly-index/v1',
        updatedAtISO: '2026-02-02T00:00:00.000Z',
        months: [],
      });

      getLatestSnapshotMock.mockResolvedValueOnce({
        schemaVersion: 'campaign-snapshot/v1',
        updatedAtISO: '2026-02-02T00:00:00.000Z',
        proposals: [
          {
            proposalId: 1,
            store: 'LOJA 06 — RIO BRANCO DO SUL CENTRO',
            group: 'Grupo C',
            status: 'APROVADO',
            entryDateISO: '2026-01-31',
            finalizedDateISO: '2026-01-31',
            approved: 1,
            rejected: 0,
          },
        ],
        storeMetrics: [
          {
            store: 'LOJA 06 — RIO BRANCO DO SUL CENTRO',
            group: 'Grupo C',
            approvedTotal: 1,
            rejectedTotal: 0,
            submittedTotal: 1,
            approvalRateTotal: 1,
            approvedYesterday: 1,
            submittedYesterday: 1,
            approvalRateYesterday: 1,
          },
        ],
        editorialSummary: {
          updatedAtISO: '2026-02-02T00:00:00.000Z',
          hero: { headline: 'h', subheadline: 's', kpiLabel: 'k', kpiValue: '1', statusLabel: 'EM DISPUTA' },
          pulse: { approvedYesterday: 1, submittedYesterday: 1, approvalRateYesterday: 1, dayKeyYesterday: '2026-01-31' },
          totals: { approved: 1, submitted: 1, approvalRate: 1 },
          comparatives: [],
          highlights: {
            topStoreByApproved: { store: '-', value: 0 },
            topStoreByApprovalRate: { store: '-', value: 0 },
            topStoreBySubmitted: { store: '-', value: 0 },
          },
          top3: [],
        },
      });

      const { getHomeViewModel } = await import('@/lib/server/homeViewModel');
      const vm = await getHomeViewModel();

      expect(vm.dataCoverage.liveMonth?.year).toBe(2026);
      expect(vm.dataCoverage.liveMonth?.month).toBe(1);
      expect(vm.storesMonthly.totalAchieved).toBe(1);
      expect(vm.storesMonthly.items.length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
