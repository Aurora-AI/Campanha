import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { getLatestSnapshot } from '@/lib/publisher';
import { getCampaignConfig, weeklyTargetTotal } from '@/lib/campaign/config';
import type { ProposalFact } from '@/lib/analytics/types';

export const runtime = 'nodejs';

type StatusLabel = 'NO JOGO' | 'EM DISPUTA' | 'FORA DO RITMO';

type StoreStats = {
  store: string;
  group: string;
  approvedYesterday: number;
  approvedWeekToYesterday: number;
};

function statusFromDayRatio(ratio: number): StatusLabel {
  if (ratio >= 1) return 'NO JOGO';
  if (ratio >= 0.9) return 'EM DISPUTA';
  return 'FORA DO RITMO';
}

function startOfWeek(dt: DateTime, weekStartsOn: 'monday' | 'sunday'): DateTime {
  const targetWeekday = weekStartsOn === 'monday' ? 1 : 7;
  const diff = (dt.weekday - targetWeekday + 7) % 7;
  return dt.minus({ days: diff }).startOf('day');
}

function toDateTime(isoDate: string, tz: string): DateTime | null {
  if (!isoDate) return null;
  const dt = DateTime.fromISO(isoDate, { zone: tz }).startOf('day');
  return dt.isValid ? dt : null;
}

function approvalDateISO(p: ProposalFact, useFinalized: boolean): string | null {
  return useFinalized ? p.finalizedDateISO ?? p.entryDateISO : p.entryDateISO;
}

function dailyTarget(weeklyGoal: number, approvedToYesterday: number, daysRemaining: number): number {
  if (daysRemaining <= 0) return 0;
  const raw = (weeklyGoal - approvedToYesterday) / daysRemaining;
  return Math.max(0, Math.round(raw));
}

function buildCampaignTrend(options: {
  approvedByDay: Map<string, number>;
  weeklyGoal: number;
  campaignStart: DateTime;
  campaignEnd: DateTime;
  weekStartsOn: 'monday' | 'sunday';
}): Array<{ dayKey: string; label: string; approved: number; target: number; trend: number }> {
  const { approvedByDay, weeklyGoal, campaignStart, campaignEnd, weekStartsOn } = options;
  const points: Array<{ dayKey: string; label: string; approved: number; target: number; trend: number }> = [];

  let cursor = campaignStart;
  while (cursor <= campaignEnd) {
    const dayKey = cursor.toISODate() ?? '';
    const approved = approvedByDay.get(dayKey) ?? 0;

    const weekStart = startOfWeek(cursor, weekStartsOn);
    const weekEnd = weekStart.plus({ days: 6 }).startOf('day');
    const weekStartClamped = DateTime.max(weekStart, campaignStart);
    const yesterday = cursor.minus({ days: 1 });

    let approvedWeekToYesterday = 0;
    let scan = weekStartClamped;
    while (scan <= yesterday) {
      const key = scan.toISODate() ?? '';
      approvedWeekToYesterday += approvedByDay.get(key) ?? 0;
      scan = scan.plus({ days: 1 });
    }

    const daysRemaining = Math.max(1, Math.floor(weekEnd.diff(cursor, 'days').days) + 1);
    const target = dailyTarget(weeklyGoal, approvedWeekToYesterday, daysRemaining);

    points.push({
      dayKey,
      label: cursor.toFormat('dd/MM'),
      approved,
      target,
      trend: 0,
    });

    cursor = cursor.plus({ days: 1 });
  }

  const windowSize = 7;
  const values = points.map((p) => p.approved);
  for (let i = 0; i < points.length; i += 1) {
    const start = Math.max(0, i - windowSize + 1);
    const slice = values.slice(start, i + 1);
    const avg = slice.reduce((sum, v) => sum + v, 0) / slice.length;
    points[i].trend = Math.round(avg * 10) / 10;
  }

  return points;
}

export async function GET() {
  try {
    const cfg = getCampaignConfig();
    const tz = cfg.timezone;
    const now = DateTime.now().setZone(tz);
    const today = now.startOf('day');
    const yesterday = today.minus({ days: 1 });
    const weekStart = startOfWeek(today, cfg.weekStartsOn);
    const weekEnd = weekStart.plus({ days: 6 }).startOf('day');

    const campaignStart = DateTime.fromISO(cfg.campaignStartISO, { zone: tz }).startOf('day');
    const campaignEnd = DateTime.fromISO(cfg.campaignEndISO, { zone: tz }).endOf('day');

    const latest = await getLatestSnapshot();

    const fallbackSummary = {
      updatedAtISO: new Date().toISOString(),
      hero: {
        headline: cfg.campaignName,
        subheadline: cfg.taglinePt,
        kpiLabel: 'Aprovações (ontem)',
        kpiValue: '-',
        statusLabel: 'EM DISPUTA',
      },
      heroCards: {
        groupResultsYesterday: Object.keys(cfg.weeklyTargetPerStoreByGroup || {}).map((group) => ({
          group,
          approvedYesterday: 0,
        })),
        highlightStore: { store: '-' },
      },
      dailyResult: {
        approvedYesterday: 0,
        targetToday: 0,
        dayRatio: 0,
        statusLabel: 'EM DISPUTA',
      },
      storeResultsYesterday: [],
      storeTotals: [],
      topYesterday: [],
      campaignTrend: { points: [] },
      pulse: { approvedYesterday: 0, submittedYesterday: 0, approvalRateYesterday: 0, dayKeyYesterday: '-' },
      totals: { approved: 0, submitted: 0, approvalRate: 0 },
      comparatives: [],
      highlights: {
        topStoreByApproved: { store: '-', value: 0 },
        topStoreByApprovalRate: { store: '-', value: 0 },
        topStoreBySubmitted: { store: '-', value: 0 },
      },
      top3: [
        { rank: 1, name: '-', value: '-' },
        { rank: 2, name: '-', value: '-' },
        { rank: 3, name: '-', value: '-' },
      ],
    };

    if (!latest) {
      return NextResponse.json(fallbackSummary, { status: 200 });
    }

    const summary = {
      ...fallbackSummary,
      ...latest.editorialSummary,
      hero: { ...fallbackSummary.hero, ...(latest.editorialSummary?.hero ?? {}) },
      pulse: { ...fallbackSummary.pulse, ...(latest.editorialSummary?.pulse ?? {}) },
      totals: { ...fallbackSummary.totals, ...(latest.editorialSummary?.totals ?? {}) },
      highlights: { ...fallbackSummary.highlights, ...(latest.editorialSummary?.highlights ?? {}) },
    };

    summary.hero.headline = cfg.campaignName;
    summary.hero.subheadline = cfg.taglinePt;
    const { dailyEditorial: _dailyEditorial, weeklyEditorial: _weeklyEditorial, ...summaryBase } = summary;

    const proposals = Array.isArray(latest.proposals) ? latest.proposals : [];
    const storeMetrics = Array.isArray(latest.storeMetrics) ? latest.storeMetrics : [];
    const useFinalized = cfg.useFinalizedDateForApprovals;

    const yesterdayKey = yesterday.toISODate() ?? '-';
    let approvedYesterday = 0;
    let approvedWeekToYesterday = 0;
    const approvedByDay = new Map<string, number>();
    const storeStats = new Map<string, StoreStats>();

    for (const p of proposals) {
      const iso = approvalDateISO(p, useFinalized);
      if (!iso) continue;
      const dt = toDateTime(iso, tz);
      if (!dt) continue;
      if (dt < campaignStart || dt > campaignEnd) continue;

      const key = dt.toISODate() ?? '';
      if (key) {
        approvedByDay.set(key, (approvedByDay.get(key) ?? 0) + (p.approved ?? 0));
      }

      if (key === yesterdayKey) approvedYesterday += p.approved ?? 0;
      if (dt >= weekStart && dt <= yesterday) approvedWeekToYesterday += p.approved ?? 0;

      const store = p.store || 'Loja';
      const group = p.group || 'Sem Grupo';
      const existing = storeStats.get(store) ?? {
        store,
        group,
        approvedYesterday: 0,
        approvedWeekToYesterday: 0,
      };
      if (key === yesterdayKey) existing.approvedYesterday += p.approved ?? 0;
      if (dt >= weekStart && dt <= yesterday) existing.approvedWeekToYesterday += p.approved ?? 0;
      storeStats.set(store, existing);
    }

    const daysRemaining = Math.max(1, Math.floor(weekEnd.diff(today, 'days').days) + 1);
    const weeklyGoal = weeklyTargetTotal(cfg);
    const targetToday = dailyTarget(weeklyGoal, approvedWeekToYesterday, daysRemaining);
    const dayRatio = targetToday > 0 ? approvedYesterday / targetToday : 1;
    const statusLabel = statusFromDayRatio(dayRatio);

    for (const m of storeMetrics) {
      if (!storeStats.has(m.store)) {
        storeStats.set(m.store, {
          store: m.store,
          group: m.group || 'Sem Grupo',
          approvedYesterday: m.approvedYesterday ?? 0,
          approvedWeekToYesterday: 0,
        });
      }
    }

    const storeResults = Array.from(storeStats.values()).map((s) => {
      const weeklyTargetStore = cfg.weeklyTargetPerStoreByGroup[s.group] ?? 0;
      const targetTodayStore = dailyTarget(weeklyTargetStore, s.approvedWeekToYesterday, daysRemaining);
      const ratio = targetTodayStore > 0 ? s.approvedYesterday / targetTodayStore : 0;
      return {
        store: s.store,
        group: s.group,
        approvedYesterday: s.approvedYesterday,
        targetToday: targetTodayStore,
        dayRatio: ratio,
      };
    });

    storeResults.sort((a, b) => b.approvedYesterday - a.approvedYesterday || a.store.localeCompare(b.store));

    const storeTotals = storeMetrics
      .map((row) => ({ store: row.store, approvedTotal: row.approvedTotal }))
      .sort((a, b) => b.approvedTotal - a.approvedTotal || a.store.localeCompare(b.store));

    const topYesterday = storeMetrics
      .filter((row) => row.approvedYesterday > 0)
      .map((row) => ({ store: row.store, approvedYesterday: row.approvedYesterday }))
      .sort((a, b) => b.approvedYesterday - a.approvedYesterday || a.store.localeCompare(b.store));

    const groupApproved = new Map<string, number>();
    for (const row of storeResults) {
      groupApproved.set(row.group, (groupApproved.get(row.group) ?? 0) + row.approvedYesterday);
    }

    const groupOrder = Object.keys(cfg.weeklyTargetPerStoreByGroup || {});
    const groupResults =
      groupOrder.length > 0
        ? groupOrder.map((group) => ({
            group,
            approvedYesterday: groupApproved.get(group) ?? 0,
          }))
        : Array.from(groupApproved.entries()).map(([group, approvedYesterday]) => ({
            group,
            approvedYesterday,
          }));

    const hasProduction = storeResults.some((r) => r.approvedYesterday > 0);
    const highlightCandidate = hasProduction
      ? storeResults
          .filter((r) => r.targetToday > 0)
          .sort((a, b) => b.dayRatio - a.dayRatio || b.approvedYesterday - a.approvedYesterday)[0] ?? storeResults[0]
      : undefined;

    const campaignTrendEnd = DateTime.min(yesterday, campaignEnd.startOf('day'));
    const campaignTrendPoints =
      campaignStart <= campaignTrendEnd
        ? buildCampaignTrend({
            approvedByDay,
            weeklyGoal,
            campaignStart,
            campaignEnd: campaignTrendEnd,
            weekStartsOn: cfg.weekStartsOn,
          })
        : [];

    const payload = {
      ...summaryBase,
      hero: {
        ...summary.hero,
        statusLabel,
        kpiValue: String(approvedYesterday),
      },
      pulse: {
        ...summary.pulse,
        approvedYesterday,
        dayKeyYesterday: yesterdayKey,
      },
      heroCards: {
        groupResultsYesterday: groupResults,
        highlightStore: { store: highlightCandidate?.store ?? '-' },
      },
      dailyResult: {
        approvedYesterday,
        targetToday,
        dayRatio,
        statusLabel,
      },
      storeResultsYesterday: storeResults,
      storeTotals,
      topYesterday,
      campaignTrend: {
        points: campaignTrendPoints,
      },
    };

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'SUMMARY_FAILED' }, { status: 500 });
  }
}
