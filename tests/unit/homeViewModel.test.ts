import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/publisher', () => ({
  getLatestSnapshot: vi.fn().mockResolvedValue(null),
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
});

