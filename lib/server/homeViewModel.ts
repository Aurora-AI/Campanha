import { getLatestSnapshot } from '@/lib/publisher';
import { toHomeViewModel, type HomeViewModel } from '@/lib/homeSnapshot';
import { loadMonthlyIndex, loadMonthlySnapshot } from '@/lib/server/monthlySnapshots';

function prevYearMonth(year: number, month: number): { year: number; month: number } {
  if (month > 1) return { year, month: month - 1 };
  return { year: year - 1, month: 12 };
}

function pickCurrentMonth(index: {
  current?: { year: number; month: number };
  months: Array<{ year: number; month: number; uploadedAtISO: string }>;
}): { year: number; month: number } | null {
  if (index.current) return index.current;
  const months = [...index.months].sort((a, b) => (a.uploadedAtISO < b.uploadedAtISO ? 1 : -1));
  return months[0] ? { year: months[0].year, month: months[0].month } : null;
}

export async function getHomeViewModel(): Promise<HomeViewModel> {
  const index = await loadMonthlyIndex();
  const currentYm = index ? pickCurrentMonth(index) : null;

  if (index && currentYm) {
    const currentPayload = await loadMonthlySnapshot(currentYm.year, currentYm.month);
    const prevYm = prevYearMonth(currentYm.year, currentYm.month);
    const hasPrev = index.months.some((m) => m.year === prevYm.year && m.month === prevYm.month);
    const baselinePayload = hasPrev ? await loadMonthlySnapshot(prevYm.year, prevYm.month) : null;

    const coverage: HomeViewModel['dataCoverage'] = {
      availableMonths: index.months.map((m) => ({
        year: m.year,
        month: m.month,
        source: m.source,
        uploadedAtISO: m.uploadedAtISO,
      })),
      currentMonthLoaded: currentYm,
      ...(baselinePayload ? { previousMonthLoaded: prevYm } : {}),
    };

    const snapshot = currentPayload?.snapshot ?? (await getLatestSnapshot().catch(() => null));
    return toHomeViewModel(snapshot, { baselineSnapshot: baselinePayload?.snapshot, dataCoverage: coverage });
  }

  const snapshot = await getLatestSnapshot().catch(() => null);
  return toHomeViewModel(snapshot);
}

