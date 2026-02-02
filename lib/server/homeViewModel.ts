import { getLatestSnapshot } from '@/lib/publisher';
import { toHomeViewModel, type HomeViewModel } from '@/lib/homeSnapshot';
import { loadMonthlyIndex, loadMonthlySnapshot } from '@/lib/server/monthlySnapshots';
import { DateTime } from 'luxon';
import { getCampaignConfig } from '@/lib/campaign/config';
import type { UnknownRecord } from '@/lib/data';

function prevYearMonth(year: number, month: number): { year: number; month: number } {
  if (month > 1) return { year, month: month - 1 };
  return { year: year - 1, month: 12 };
}

function asRecord(input: unknown): UnknownRecord | null {
  return input && typeof input === 'object' ? (input as UnknownRecord) : null;
}

function inferLiveYearMonthFromSnapshot(args: {
  snapshot: unknown | null;
  tz: string;
  fallbackNow: DateTime;
}): { year: number; month: number } {
  const { snapshot, tz, fallbackNow } = args;
  const root = asRecord(snapshot);

  const pulse =
    root && root.editorialSummary && typeof root.editorialSummary === 'object'
      ? asRecord((root.editorialSummary as UnknownRecord).pulse)
      : null;

  const dayKey = pulse && typeof pulse.dayKeyYesterday === 'string' ? (pulse.dayKeyYesterday as string) : null;
  if (dayKey) {
    const dt = DateTime.fromISO(dayKey, { zone: tz }).startOf('day');
    if (dt.isValid) return { year: dt.year, month: dt.month };
  }

  const proposals = root && Array.isArray(root.proposals) ? (root.proposals as UnknownRecord[]) : [];
  let best: DateTime | null = null;
  for (const p of proposals) {
    const entry = typeof p?.entryDateISO === 'string' ? (p.entryDateISO as string) : null;
    if (!entry) continue;
    const dt = DateTime.fromISO(entry, { zone: tz }).startOf('day');
    if (!dt.isValid) continue;
    if (!best || dt > best) best = dt;
  }

  const base = best ?? fallbackNow;
  return { year: base.year, month: base.month };
}

export async function getHomeViewModel(): Promise<HomeViewModel> {
  const index = await loadMonthlyIndex();
  const snapshot = await getLatestSnapshot().catch(() => null);

  const cfg = getCampaignConfig();
  const nowTz = DateTime.now().setZone(cfg.timezone);
  const liveYm = inferLiveYearMonthFromSnapshot({ snapshot, tz: cfg.timezone, fallbackNow: nowTz });

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
