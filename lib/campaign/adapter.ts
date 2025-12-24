import { CampaignStatus, MOCK_DB, SandboxData } from './mock';
import { ProposalFact, StoreMetrics } from '@/lib/analytics/types';
import { DateTime } from 'luxon';
import type { UnknownRecord } from '@/lib/data';
import { countStoresByGroup, getCampaignConfig } from '@/lib/campaign/config';
import { groupLabelFromKey, normalizeGroupKey } from '@/lib/campaign/groupIdentity';

// Helper types matching the Mock DB structure
type GroupGoal = { group: string; actual: number; target: number };

function asRecord(input: unknown): UnknownRecord | null {
  return input && typeof input === 'object' ? (input as UnknownRecord) : null;
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function normalizeGroupLabel(value: string | null | undefined): string {
  if (!value) return 'Sem Grupo';
  return groupLabelFromKey(normalizeGroupKey(value));
}

function approvalDateISO(p: ProposalFact, useFinalized: boolean): string | null {
  if (useFinalized) return p.finalizedDateISO ?? p.entryDateISO ?? null;
  return p.entryDateISO ?? null;
}

function startOfWeek(dt: DateTime, weekStartsOn: 'monday' | 'sunday'): DateTime {
  const targetWeekday = weekStartsOn === 'monday' ? 1 : 7;
  const diff = (dt.weekday - targetWeekday + 7) % 7;
  return dt.minus({ days: diff }).startOf('day');
}

function formatWeekLabel(options: { start: DateTime; end: DateTime }): string {
  const start = options.start.setLocale('pt-BR');
  const end = options.end.setLocale('pt-BR');

  const startDay = start.toFormat('dd');
  const endDay = end.toFormat('dd');

  const startMonth = start.toFormat('LLL');
  const endMonth = end.toFormat('LLL');

  const monthPart = startMonth === endMonth ? startMonth : `${startMonth}–${endMonth}`;
  return `Semana ${startDay}–${endDay} ${monthPart}`;
}

function groupStatusFromAttainment(attainmentPct: number): CampaignStatus {
  if (attainmentPct >= 1) return 'NO_JOGO';
  if (attainmentPct >= 0.9) return 'EM_DISPUTA';
  return 'FORA_DO_RITMO';
}

function buildGroupsWeekly(options: {
  proposals: ProposalFact[];
  storeMetrics: StoreMetrics[];
  tz: string;
  now: DateTime;
  useFinalized: boolean;
  weeklyTargetPerStoreByGroup: Record<string, number>;
  storesPerGroup: Record<string, number>;
}): Pick<SandboxData, 'groups' | 'metaAudit'> {
  const {
    proposals,
    storeMetrics,
    tz,
    now,
    useFinalized,
    weeklyTargetPerStoreByGroup,
    storesPerGroup,
  } = options;

  const weekStart = startOfWeek(now, 'monday');
  const weekLabel = formatWeekLabel({
    start: weekStart,
    end: DateTime.min(weekStart.plus({ days: 6 }).endOf('day'), now),
  });

  const achievedByGroup = new Map<string, number>();
  for (const p of proposals) {
    const iso = approvalDateISO(p, useFinalized);
    if (!iso) continue;
    const dt = DateTime.fromISO(iso, { zone: tz }).startOf('day');
    if (!dt.isValid) continue;

    if (dt < weekStart) continue;
    if (dt > now) continue;

    const group = normalizeGroupLabel(p.group);
    achievedByGroup.set(group, (achievedByGroup.get(group) ?? 0) + (p.approved ?? 0));
  }
  const groups = Object.keys(weeklyTargetPerStoreByGroup);

  const items = groups.map((groupName) => {
    const perStore = weeklyTargetPerStoreByGroup[groupName] ?? 0;
    const storeCount = storesPerGroup[groupName] ?? 0;
    const target = perStore * storeCount;
    const achieved = achievedByGroup.get(groupName) ?? 0;
    const attainmentPct = target > 0 ? achieved / target : 0;

    const status = groupStatusFromAttainment(attainmentPct);

    const statusEmoji: '🟢' | '🟡' | '🔴' = status === 'NO_JOGO' ? '🟢' : status === 'FORA_DO_RITMO' ? '🔴' : '🟡';

    return { groupId: groupName, groupName, achieved, target, attainmentPct, status: statusEmoji };
  });

  return {
    groups: {
      period: 'weekly',
      weekLabel,
      weekStartISO: weekStart.toISO() ?? '',
      weekEndISO: now.toISO() ?? '',
      items,
    },
    metaAudit: {
      groupsPeriod: 'weekly',
      weekStartISO: weekStart.toISO() ?? '',
      weekEndISO: now.toISO() ?? '',
      targets: {
        byGroup: groups.map((groupName) => {
          const perStore = weeklyTargetPerStoreByGroup[groupName] ?? 0;
          const storeCount = storesPerGroup[groupName] ?? 0;
          const target = perStore * storeCount;
          return {
            groupId: groupName,
            target,
            source: 'config/campaign.config.json:weeklyTargetPerStoreByGroup × lojas do grupo',
          };
        }),
        byStore: storeMetrics
          .map((row) => ({
            storeId: row.store,
            storeName: row.store,
            source: 'snapshot.storeMetrics',
          }))
          .sort((a, b) => a.storeName.localeCompare(b.storeName)),
      },
    },
  };
}

function weekOfMonth(day: number): number {
  if (!Number.isFinite(day) || day <= 0) return 1;
  return Math.floor((day - 1) / 7) + 1;
}

function prevYearMonth(year: number, month: number): { year: number; month: number } {
  if (month > 1) return { year, month: month - 1 };
  return { year: year - 1, month: 12 };
}

function monthWindow(tz: string, year: number, month: number): { start: DateTime; end: DateTime } {
  const start = DateTime.fromObject({ year, month, day: 1 }, { zone: tz }).startOf('day');
  const end = start.endOf('month');
  return { start, end };
}

function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function monthLabelPtBr(tz: string, year: number, month: number): string {
  const { start } = monthWindow(tz, year, month);
  const label = start.setLocale('pt-BR').toFormat('LLL/yyyy');
  return capitalizeFirst(label);
}

function inferYearMonthFromProposals(proposals: ProposalFact[], tz: string, fallbackNow: DateTime): { year: number; month: number } {
  let best: DateTime | null = null;
  for (const p of proposals) {
    const dt = DateTime.fromISO(p.entryDateISO, { zone: tz }).startOf('day');
    if (!dt.isValid) continue;
    if (!best || dt > best) best = dt;
  }
  const base = best ?? fallbackNow;
  return { year: base.year, month: base.month };
}

function buildStoresMonthly(options: {
  proposals: ProposalFact[];
  tz: string;
  useFinalized: boolean;
  year: number;
  month: number;
  now: DateTime;
}): SandboxData['storesMonthly'] {
  const { proposals, tz, useFinalized, year, month, now } = options;
  const { start, end } = monthWindow(tz, year, month);

  const isCurrentMonth = now.year === year && now.month === month;
  const to = isCurrentMonth ? DateTime.min(now.endOf('day'), end) : end;

  const totalsByStore = new Map<string, number>();
  let totalAchieved = 0;

  for (const p of proposals) {
    const iso = approvalDateISO(p, useFinalized);
    if (!iso) continue;
    const dt = DateTime.fromISO(iso, { zone: tz }).startOf('day');
    if (!dt.isValid) continue;
    if (dt < start) continue;
    if (dt > to) continue;

    const storeName = p.store;
    if (!storeName) continue;
    const approved = p.approved ?? 0;
    totalsByStore.set(storeName, (totalsByStore.get(storeName) ?? 0) + approved);
    totalAchieved += approved;
  }

  const items = [...totalsByStore.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([storeName, achieved]) => ({ storeId: storeName, storeName, achieved }));

  return {
    monthLabel: monthLabelPtBr(tz, year, month),
    fromISO: start.toISO() ?? '',
    toISO: to.toISO() ?? '',
    items,
    totalAchieved,
  };
}

function aggregateWeeklyGoals(options: {
  proposals: ProposalFact[];
  tz: string;
  weekStartsOn: 'monday' | 'sunday';
  useFinalized: boolean;
  weeklyTargetPerStoreByGroup: Record<string, number>;
  storesPerGroup: Record<string, number>;
}): GroupGoal[] {
  const { proposals, tz, weekStartsOn, useFinalized, weeklyTargetPerStoreByGroup, storesPerGroup } = options;
  const today = DateTime.now().setZone(tz).startOf('day');
  const weekStart = startOfWeek(today, weekStartsOn);
  const yesterday = today.minus({ days: 1 });

  const approvedByGroup = new Map<string, number>();

  for (const p of proposals) {
    const iso = approvalDateISO(p, useFinalized);
    if (!iso) continue;

    const dt = DateTime.fromISO(iso, { zone: tz }).startOf('day');
    if (!dt.isValid) continue;
    if (dt < weekStart || dt > yesterday) continue;

    const group = normalizeGroupLabel(p.group);
    approvedByGroup.set(group, (approvedByGroup.get(group) ?? 0) + (p.approved ?? 0));
  }

  const groupsOrdered = Object.keys(weeklyTargetPerStoreByGroup);
  return groupsOrdered.map((group) => {
    const perStore = weeklyTargetPerStoreByGroup[group] ?? 0;
    const storeCount = storesPerGroup[group] ?? 0;
    const target = perStore * storeCount;
    const actual = approvedByGroup.get(group) ?? 0;
    return { group, actual, target: target > 0 ? target : 1 };
  });
}

function countMonthDaily(options: {
  proposals: ProposalFact[];
  tz: string;
  useFinalized: boolean;
  year: number;
  month: number;
}): { proposalsByDay: Map<string, number>; approvalsByDay: Map<string, number> } {
  const { proposals, tz, useFinalized, year, month } = options;
  const { start, end } = monthWindow(tz, year, month);

  const proposalsByDay = new Map<string, number>();
  const approvalsByDay = new Map<string, number>();

  for (const p of proposals) {
    const entry = DateTime.fromISO(p.entryDateISO, { zone: tz }).startOf('day');
    if (entry.isValid && entry >= start && entry <= end) {
      const key = entry.toISODate() ?? '';
      if (key) proposalsByDay.set(key, (proposalsByDay.get(key) ?? 0) + 1);
    }

    const approvalISO = approvalDateISO(p, useFinalized);
    if (!approvalISO) continue;
    const approval = DateTime.fromISO(approvalISO, { zone: tz }).startOf('day');
    if (!approval.isValid || approval < start || approval > end) continue;
    const key = approval.toISODate() ?? '';
    if (!key) continue;
    approvalsByDay.set(key, (approvalsByDay.get(key) ?? 0) + (p.approved ?? 0));
  }

  return { proposalsByDay, approvalsByDay };
}

function buildTrendComparative(options: {
  currentProposals: ProposalFact[];
  baselineProposals: ProposalFact[];
  baselineLoaded: boolean;
  tz: string;
  useFinalized: boolean;
  year: number;
  month: number;
  now: DateTime;
}): SandboxData['trendComparative'] {
  const { currentProposals, baselineProposals, baselineLoaded, tz, useFinalized, year, month, now } = options;
  const baselineYm = prevYearMonth(year, month);
  const currentWindow = monthWindow(tz, year, month);
  const baselineWindow = monthWindow(tz, baselineYm.year, baselineYm.month);

  const isCurrentMonth = now.year === year && now.month === month;
  const currentTo = (isCurrentMonth ? DateTime.min(now.endOf('day'), currentWindow.end) : currentWindow.end).startOf('day');

  const currentCounts = countMonthDaily({ proposals: currentProposals, tz, useFinalized, year, month });
  const baselineCounts = baselineLoaded
    ? countMonthDaily({
        proposals: baselineProposals,
        tz,
        useFinalized,
        year: baselineYm.year,
        month: baselineYm.month,
      })
    : { proposalsByDay: new Map<string, number>(), approvalsByDay: new Map<string, number>() };

  const baselineMap = new Map<string, string>();
  const lastByWeekday = new Map<number, string>();
  let cursor = baselineWindow.start.startOf('day');
  while (cursor <= baselineWindow.end.startOf('day')) {
    const key = cursor.toISODate() ?? '';
    if (key) {
      baselineMap.set(`${cursor.weekday}-${weekOfMonth(cursor.day)}`, key);
      lastByWeekday.set(cursor.weekday, key);
    }
    cursor = cursor.plus({ days: 1 });
  }

  const mappedBaseline = (dt: DateTime): string | null => {
    const key = baselineMap.get(`${dt.weekday}-${weekOfMonth(dt.day)}`);
    if (key) return key;
    return lastByWeekday.get(dt.weekday) ?? null;
  };

  const proposals: SandboxData['trendComparative']['metrics']['proposals'] = [];
  const approvals: SandboxData['trendComparative']['metrics']['approvals'] = [];

  let cPropTotal = 0;
  let bPropTotal = 0;
  let cApprTotal = 0;
  let bApprTotal = 0;

  let dayCursor = currentWindow.start.startOf('day');
  while (dayCursor <= currentTo) {
    const dateISO = dayCursor.toISODate() ?? '';
    const bISO = mappedBaseline(dayCursor);

    const cProposals = dateISO ? currentCounts.proposalsByDay.get(dateISO) ?? 0 : 0;
    const cApprovals = dateISO ? currentCounts.approvalsByDay.get(dateISO) ?? 0 : 0;
    const bProposalsNum = baselineLoaded && bISO ? baselineCounts.proposalsByDay.get(bISO) ?? 0 : 0;
    const bApprovalsNum = baselineLoaded && bISO ? baselineCounts.approvalsByDay.get(bISO) ?? 0 : 0;
    const bProposals = baselineLoaded ? bProposalsNum : null;
    const bApprovals = baselineLoaded ? bApprovalsNum : null;

    proposals.push({ dateISO, currentValue: cProposals, baselineValue: bProposals });
    approvals.push({ dateISO, currentValue: cApprovals, baselineValue: bApprovals });

    cPropTotal += cProposals;
    if (baselineLoaded) bPropTotal += bProposalsNum;
    cApprTotal += cApprovals;
    if (baselineLoaded) bApprTotal += bApprovalsNum;

    dayCursor = dayCursor.plus({ days: 1 });
  }

  const summary: SandboxData['trendComparative']['summary'] = {};
  summary.proposals = {
    currentTotal: cPropTotal,
    baselineTotal: baselineLoaded ? bPropTotal : null,
    ...(baselineLoaded && bPropTotal > 0 ? { deltaPct: (cPropTotal - bPropTotal) / bPropTotal } : {}),
  };
  summary.approvals = {
    currentTotal: cApprTotal,
    baselineTotal: baselineLoaded ? bApprTotal : null,
    ...(baselineLoaded && bApprTotal > 0 ? { deltaPct: (cApprTotal - bApprTotal) / bApprTotal } : {}),
  };
  const cRate = cPropTotal > 0 ? cApprTotal / cPropTotal : 0;
  const bRate = baselineLoaded && bPropTotal > 0 ? bApprTotal / bPropTotal : 0;
  summary.approvalRate = {
    currentPct: cRate,
    baselinePct: baselineLoaded ? bRate : null,
    ...(baselineLoaded ? { deltaPp: (cRate - bRate) * 100 } : {}),
  };

  return {
    mode: 'weekday_vs_previous_month',
    current: {
      year,
      month,
      fromISO: currentWindow.start.toISO() ?? '',
      toISO: (isCurrentMonth ? DateTime.min(now.endOf('day'), currentWindow.end) : currentWindow.end).toISO() ?? '',
    },
    baseline: {
      year: baselineYm.year,
      month: baselineYm.month,
      fromISO: baselineWindow.start.toISO() ?? '',
      toISO: baselineWindow.end.toISO() ?? '',
    },
    metrics: { proposals, approvals },
    summary,
  };
}

function normalizeStatus(input: string | null | undefined): CampaignStatus {
  const raw = (input ?? '').toUpperCase();
  if (raw.includes('NO') && raw.includes('JOGO')) return 'NO_JOGO';
  if (raw.includes('FORA') && raw.includes('RITMO')) return 'FORA_DO_RITMO';
  if (raw.includes('EM') && raw.includes('DISPUTA')) return 'EM_DISPUTA';
  return 'EM_DISPUTA';
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function heroSubheadlineFrom(args: {
  status: CampaignStatus;
  yesterdayApproved: number;
  dayKeyYesterday: string;
  fallback: string;
}): string {
  if (!args.dayKeyYesterday) return args.fallback;
  const n = args.yesterdayApproved;
  const core = `Ontem foram ${n} aprovações —`;
  switch (args.status) {
    case 'NO_JOGO':
      return `${core} manter o ritmo hoje.`;
    case 'FORA_DO_RITMO':
      return `${core} priorize retornos rápidos hoje.`;
    case 'EM_DISPUTA':
    default:
      return `${core} ajuste o foco para ganhar velocidade.`;
  }
}

function nextActionFromStatus(status: CampaignStatus): string {
  switch (status) {
    case 'NO_JOGO':
      return 'Consolidar pendências e ampliar contato com oportunidades quentes.';
    case 'FORA_DO_RITMO':
      return 'Recuperar terreno: ativar retornos rápidos e reaquecer a fila.';
    case 'EM_DISPUTA':
    default:
      return 'Ganhar tração hoje: retomar follow-ups e destravar retornos em aberto.';
  }
}

function reengagementFromStatus(status: CampaignStatus): SandboxData['reengagement'] {
  switch (status) {
    case 'NO_JOGO':
      return {
        title: 'Manter o ritmo',
        subtitle: 'Feche pendências cedo e use o ganho do dia para ampliar volume.',
      };
    case 'FORA_DO_RITMO':
      return {
        title: 'Recuperar terreno',
        subtitle: 'Ative contato rápido e destrave pendências para reaquecer a fila.',
      };
    case 'EM_DISPUTA':
    default:
      return {
        title: 'Virada possível',
        subtitle: 'Retome follow-ups e priorize retornos em aberto para ganhar velocidade.',
      };
  }
}

export type AdaptCampaignOptions = {
  baselineSnapshot?: unknown;
  dataCoverage?: SandboxData['dataCoverage'];
};

export function adaptSnapshotToCampaign(snapshot: unknown, options: AdaptCampaignOptions = {}): SandboxData {
  const cfg = getCampaignConfig();
  const root = asRecord(snapshot);
  const editorialSummary = asRecord(root?.editorialSummary);

  const tzNow = DateTime.now().setZone(cfg.timezone);
  const baselineLoaded = !!options.baselineSnapshot;
  const baselineRoot = asRecord(options.baselineSnapshot);
  const baselineProposals = Array.isArray(baselineRoot?.proposals) ? (baselineRoot?.proposals as ProposalFact[]) : [];

  const inferredCurrentYm = options.dataCoverage?.liveMonth
    ? { year: options.dataCoverage.liveMonth.year, month: options.dataCoverage.liveMonth.month }
    : options.dataCoverage?.currentMonthLoaded ?? { year: tzNow.year, month: tzNow.month };
  const inferredPrevYm = prevYearMonth(inferredCurrentYm.year, inferredCurrentYm.month);

  const dataCoverage: SandboxData['dataCoverage'] =
    options.dataCoverage ??
    ({
      liveMonth: { year: inferredCurrentYm.year, month: inferredCurrentYm.month, source: 'publish-csv' },
      availableMonths: [],
      currentMonthLoaded: inferredCurrentYm,
      ...(baselineLoaded
        ? { baselineMonthLoaded: { year: inferredPrevYm.year, month: inferredPrevYm.month, source: 'monthlySnapshots' } }
        : {}),
      ...(baselineLoaded ? { previousMonthLoaded: inferredPrevYm } : {}),
    } satisfies SandboxData['dataCoverage']);

  if (!root || !editorialSummary) {
    const storesPerGroup = countStoresByGroup(cfg);
    const weeklyGoalsBase = aggregateWeeklyGoals({
      proposals: [],
      tz: cfg.timezone,
      weekStartsOn: cfg.weekStartsOn,
      useFinalized: cfg.useFinalizedDateForApprovals,
      weeklyTargetPerStoreByGroup: cfg.weeklyTargetPerStoreByGroup,
      storesPerGroup,
    });

    const weeklyGoals = weeklyGoalsBase.map((g) => ({ ...g, onTrack: false }));

    const { groups, metaAudit } = buildGroupsWeekly({
      proposals: [],
      storeMetrics: [],
      tz: cfg.timezone,
      now: tzNow,
      useFinalized: cfg.useFinalizedDateForApprovals,
      weeklyTargetPerStoreByGroup: cfg.weeklyTargetPerStoreByGroup,
      storesPerGroup,
    });

    const storesMonthly = buildStoresMonthly({
      proposals: [],
      tz: cfg.timezone,
      useFinalized: cfg.useFinalizedDateForApprovals,
      year: dataCoverage.currentMonthLoaded.year,
      month: dataCoverage.currentMonthLoaded.month,
      now: tzNow,
    });

    const trendComparative = buildTrendComparative({
      currentProposals: [],
      baselineProposals,
      baselineLoaded,
      tz: cfg.timezone,
      useFinalized: cfg.useFinalizedDateForApprovals,
      year: dataCoverage.currentMonthLoaded.year,
      month: dataCoverage.currentMonthLoaded.month,
      now: tzNow,
    });

    return {
      hero: {
        headline: cfg.campaignName,
        subheadline: 'Sem dados publicados ainda.',
        weeklyGoals,
        yesterdayApproved: { value: 0, label: 'Aprovados ontem' },
      },
      movement: {
        title: 'Resultado de ontem',
        subtitle: 'Sem dados publicados ainda para leitura de ontem.',
        dayLabel: 'Ontem',
        yesterdayResult: { value: 0, label: 'Aprovados ontem' },
        podium: [
          { label: 'Sem registro', value: '—' },
          { label: 'Sem registro', value: '—' },
          { label: 'Sem registro', value: '—' },
        ],
        storeColumns: [
          { title: 'Lojas 04–09', items: [] },
          { title: 'Lojas 10–15', items: [] },
          { title: 'Lojas 16–21', items: [] },
        ],
      },
      campaign: {
        groupsRadial: weeklyGoalsBase.map((g) => ({ group: g.group, score: 0 })),
        status: 'EM_DISPUTA',
        statusLabel: 'EM DISPUTA',
        nextAction: nextActionFromStatus('EM_DISPUTA'),
      },
      groups,
      metaAudit,
      storesMonthly,
      trendComparative,
      dataCoverage,
      reengagement: reengagementFromStatus('EM_DISPUTA'),
      kpis: [
        { label: 'Aprovados (total)', value: '0' },
        { label: 'Digitados (total)', value: '0' },
        { label: 'Taxa de aprovação', value: '0%' },
        { label: 'Lojas ativas', value: String(Object.values(storesPerGroup).reduce((sum, n) => sum + n, 0)) },
      ],
    };
  }

  const heroObj = asRecord(editorialSummary.hero);
  const pulseObj = asRecord(editorialSummary.pulse);
  const totalsObj = asRecord(editorialSummary.totals);
  const comparatives = Array.isArray(editorialSummary.comparatives) ? editorialSummary.comparatives : [];
  const dod = comparatives.length > 0 && typeof comparatives[0] === 'object' ? (comparatives[0] as UnknownRecord) : null;

  const storeMetrics = Array.isArray(root.storeMetrics) ? (root.storeMetrics as StoreMetrics[]) : [];
  const proposals = Array.isArray(root.proposals) ? (root.proposals as ProposalFact[]) : [];

  const currentYm = options.dataCoverage?.liveMonth
    ? { year: options.dataCoverage.liveMonth.year, month: options.dataCoverage.liveMonth.month }
    : options.dataCoverage?.currentMonthLoaded ?? inferYearMonthFromProposals(proposals, cfg.timezone, tzNow);
  const prevYm = prevYearMonth(currentYm.year, currentYm.month);
  const baselineEnabled =
    !!options.dataCoverage?.baselineMonthLoaded || !!options.dataCoverage?.previousMonthLoaded || baselineLoaded;
  const resolvedCoverage: SandboxData['dataCoverage'] =
    options.dataCoverage ??
    ({
      liveMonth: { year: currentYm.year, month: currentYm.month, source: 'publish-csv' },
      availableMonths: [],
      currentMonthLoaded: currentYm,
      ...(baselineLoaded
        ? { baselineMonthLoaded: { year: prevYm.year, month: prevYm.month, source: 'monthlySnapshots' } }
        : {}),
      ...(baselineEnabled ? { previousMonthLoaded: prevYm } : {}),
    } satisfies SandboxData['dataCoverage']);

  // 1. Hero Data
  const storesPerGroup = countStoresByGroup(cfg);
  const weeklyGoals = aggregateWeeklyGoals({
    proposals,
    tz: cfg.timezone,
    weekStartsOn: cfg.weekStartsOn,
    useFinalized: cfg.useFinalizedDateForApprovals,
    weeklyTargetPerStoreByGroup: cfg.weeklyTargetPerStoreByGroup,
    storesPerGroup,
  });

  // 2. Groups (Radial)
  // Re-use aggregation or specific map
  const groupsRadial = weeklyGoals.map((g) => {
    const ratio = g.target > 0 ? g.actual / g.target : 0;
    return { group: g.group, score: clampScore(Math.round(ratio * 100)) };
  });

  // 3. Comparison
  const approvedYesterday = safeNumber(pulseObj?.approvedYesterday, 0);
  const yesterdayResult = {
    value: approvedYesterday,
    label: 'Aprovados ontem',
    deltaText: Number.isFinite(safeNumber(dod?.approvedDeltaAbs, Number.NaN))
      ? `${safeNumber(dod?.approvedDeltaAbs, 0) >= 0 ? '+' : ''}${safeNumber(dod?.approvedDeltaAbs, 0)} vs dia anterior`
      : undefined,
  };

  const campaignStatus = normalizeStatus(safeString(heroObj?.statusLabel));

  const { groups, metaAudit } = buildGroupsWeekly({
    proposals,
    storeMetrics,
    tz: cfg.timezone,
    now: tzNow,
    useFinalized: cfg.useFinalizedDateForApprovals,
    weeklyTargetPerStoreByGroup: cfg.weeklyTargetPerStoreByGroup,
    storesPerGroup,
  });

  const dayKeyYesterday = safeString(pulseObj?.dayKeyYesterday, '');
  const dayLabel = (() => {
    if (!dayKeyYesterday) return 'Ontem';
    const dt = DateTime.fromISO(dayKeyYesterday, { zone: cfg.timezone });
    return dt.isValid ? dt.toFormat('dd/MM') : 'Ontem';
  })();

  const rankedStores = [...storeMetrics].sort((a, b) => {
    const diff = b.approvedYesterday - a.approvedYesterday;
    if (diff !== 0) return diff;
    return a.store.localeCompare(b.store);
  });

  const podiumPicked = rankedStores.slice(0, 3).map((row) => ({
    label: row.store,
    value: `${row.approvedYesterday} aprov.`,
  }));
  const podium: SandboxData['movement']['podium'] = [
    podiumPicked[0] ?? { label: '—', value: '—' },
    podiumPicked[1] ?? { label: '—', value: '—' },
    podiumPicked[2] ?? { label: '—', value: '—' },
  ];

  const remainder = rankedStores.slice(3).map((row) => ({
    label: row.store,
    value: `${row.approvedYesterday} aprov.`,
  }));

  const storeColumns: SandboxData['movement']['storeColumns'] = [
    { title: 'Lojas 04–09', items: remainder.slice(0, 6) },
    { title: 'Lojas 10–15', items: remainder.slice(6, 12) },
    { title: 'Lojas 16–21', items: remainder.slice(12, 18) },
  ];

  const explicitHeroSubheadline = safeString(heroObj?.subheadline, '');
  const fallbackHeroSubheadline = safeString(cfg.taglinePt, 'Leitura editorial do ritmo diário.');
  const heroSubheadline = heroSubheadlineFrom({
    status: campaignStatus,
    yesterdayApproved: approvedYesterday,
    dayKeyYesterday,
    fallback: fallbackHeroSubheadline,
  });

  const storesMonthly = buildStoresMonthly({
    proposals,
    tz: cfg.timezone,
    useFinalized: cfg.useFinalizedDateForApprovals,
    year: resolvedCoverage.currentMonthLoaded.year,
    month: resolvedCoverage.currentMonthLoaded.month,
    now: tzNow,
  });

  const trendComparative = buildTrendComparative({
    currentProposals: proposals,
    baselineProposals,
    baselineLoaded,
    tz: cfg.timezone,
    useFinalized: cfg.useFinalizedDateForApprovals,
    year: resolvedCoverage.currentMonthLoaded.year,
    month: resolvedCoverage.currentMonthLoaded.month,
    now: tzNow,
  });

  return {
    hero: {
      headline: safeString(heroObj?.headline, cfg.campaignName),
      subheadline: explicitHeroSubheadline || heroSubheadline,
      weeklyGoals:
        weeklyGoals.length > 0
          ? weeklyGoals.map((g) => ({ ...g, onTrack: g.actual >= g.target }))
          : MOCK_DB.hero.weeklyGoals,
      yesterdayApproved: {
        value: approvedYesterday,
        label: 'Aprovados ontem',
      },
    },
    movement: {
      title: 'Resultado de ontem',
      subtitle: 'Três referências de aprovações. A lista abaixo aparece sem ordem de mérito.',
      dayLabel,
      yesterdayResult,
      podium,
      storeColumns,
    },
    campaign: {
      groupsRadial,
      status: campaignStatus,
      statusLabel: safeString(heroObj?.statusLabel, "EM DISPUTA"),
      nextAction: nextActionFromStatus(campaignStatus),
    },
    groups,
    metaAudit,
    storesMonthly,
    trendComparative,
    dataCoverage: resolvedCoverage,
    reengagement: reengagementFromStatus(campaignStatus),
    kpis: [
        { label: "Aprovados (total)", value: String(safeNumber(totalsObj?.approved, 0)) },
        { label: "Digitados (total)", value: String(safeNumber(totalsObj?.submitted, 0)) },
        { label: "Taxa de aprovação", value: `${Math.round(safeNumber(totalsObj?.approvalRate, 0) * 100)}%` },
        { label: "Lojas ativas", value: String(storeMetrics.length) }
    ],
  };
}
