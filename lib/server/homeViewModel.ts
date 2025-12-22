import { getLatestSnapshot } from '@/lib/publisher';
import { toHomeViewModel, type HomeViewModel } from '@/lib/homeSnapshot';
import { loadMonthlyIndex, loadMonthlySnapshot } from '@/lib/server/monthlySnapshots';
import { DateTime } from 'luxon';
import { getCampaignConfig } from '@/lib/campaign/config';

function prevYearMonth(year: number, month: number): { year: number; month: number } {
  if (month > 1) return { year, month: month - 1 };
  return { year: year - 1, month: 12 };
}

export async function getHomeViewModel(): Promise<HomeViewModel> {
  const index = await loadMonthlyIndex();
  const snapshot = await getLatestSnapshot().catch(() => null);

  const cfg = getCampaignConfig();
  const nowTz = DateTime.now().setZone(cfg.timezone);
  const liveYm = { year: nowTz.year, month: nowTz.month };

  const prevYm = prevYearMonth(liveYm.year, liveYm.month);
  const baselineEntry = index?.months?.find((m) => m.year === prevYm.year && m.month === prevYm.month) ?? null;
  const baselinePayload = baselineEntry ? await loadMonthlySnapshot(prevYm.year, prevYm.month) : null;
  const publishedAtISO =
    snapshot && typeof snapshot === 'object' && typeof (snapshot as { updatedAtISO?: unknown }).updatedAtISO === 'string'
      ? ((snapshot as { updatedAtISO: string }).updatedAtISO as string)
      : undefined;

  const coverage: HomeViewModel['dataCoverage'] = {
    liveMonth: {
      year: liveYm.year,
      month: liveYm.month,
      source: 'publish-csv',
      publishedAtISO,
    },
    availableMonths:
      index?.months?.map((m) => ({
        year: m.year,
        month: m.month,
        source: m.source,
        uploadedAtISO: m.uploadedAtISO,
      })) ?? [],
    currentMonthLoaded: liveYm,
    ...(baselinePayload
      ? {
          baselineMonthLoaded: {
            year: prevYm.year,
            month: prevYm.month,
            source: 'monthlySnapshots',
            uploadedAtISO: baselineEntry?.uploadedAtISO,
          },
          previousMonthLoaded: prevYm,
        }
      : {}),
  };

  return toHomeViewModel(snapshot, { baselineSnapshot: baselinePayload?.snapshot, dataCoverage: coverage });
}
