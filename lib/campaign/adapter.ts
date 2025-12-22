import { CampaignStatus, MOCK_DB, SandboxData } from './mock';
import { ProposalFact, StoreMetrics } from '@/lib/analytics/types';
import { DateTime } from 'luxon';
import type { UnknownRecord } from '@/lib/data';
import { countStoresByGroup, getCampaignConfig } from '@/lib/campaign/config';

// Helper types matching the Mock DB structure
type GroupGoal = { group: string; actual: number; target: number };
type SeriesPoint = { day: string; value: number };

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

function approvalDateISO(p: ProposalFact, useFinalized: boolean): string | null {
  if (useFinalized) return p.finalizedDateISO ?? p.entryDateISO ?? null;
  return p.entryDateISO ?? null;
}

function startOfWeek(dt: DateTime, weekStartsOn: 'monday' | 'sunday'): DateTime {
  const targetWeekday = weekStartsOn === 'monday' ? 1 : 7;
  const diff = (dt.weekday - targetWeekday + 7) % 7;
  return dt.minus({ days: diff }).startOf('day');
}

function endOfDay(dt: DateTime): DateTime {
  return dt.endOf('day');
}

function effectiveNow(now: DateTime, campaignStart: DateTime, campaignEnd: DateTime): DateTime | null {
  if (now < campaignStart) return null;
  if (now > campaignEnd) return campaignEnd;
  return now;
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
  campaignStart: DateTime;
  campaignEnd: DateTime;
  now: DateTime;
  useFinalized: boolean;
  weeklyTargetPerStoreByGroup: Record<string, number>;
  storesPerGroup: Record<string, number>;
}): Pick<SandboxData['campaign'], 'groupsWeekly' | 'metaAudit'> {
  const {
    proposals,
    storeMetrics,
    tz,
    campaignStart,
    campaignEnd,
    now,
    useFinalized,
    weeklyTargetPerStoreByGroup,
    storesPerGroup,
  } = options;

  const nowEff = effectiveNow(now, campaignStart, campaignEnd);
  const base = nowEff ?? campaignStart;

  const weekStart = startOfWeek(base, 'monday');
  const weekEnd = endOfDay(weekStart.plus({ days: 6 }));

  const effectiveStart = DateTime.max(weekStart, campaignStart);
  const effectiveEnd = nowEff ? DateTime.min(weekEnd, campaignEnd, nowEff) : effectiveStart.minus({ milliseconds: 1 });

  const weekLabel = formatWeekLabel({ start: effectiveStart, end: DateTime.min(weekEnd, campaignEnd) });

  const achievedByGroup = new Map<string, number>();
  if (nowEff) {
    for (const p of proposals) {
      const iso = approvalDateISO(p, useFinalized);
      if (!iso) continue;
      const dt = DateTime.fromISO(iso, { zone: tz }).startOf('day');
      if (!dt.isValid) continue;

      if (dt < effectiveStart.startOf('day')) continue;
      if (dt > effectiveEnd) continue;

      const group = p.group || 'Sem Grupo';
      achievedByGroup.set(group, (achievedByGroup.get(group) ?? 0) + (p.approved ?? 0));
    }
  } else if (storeMetrics.length > 0) {
    // Semana vazia (antes da campanha): mantemos achieved = 0
    void storeMetrics;
  }

  const groups = Object.keys(weeklyTargetPerStoreByGroup);

  const items = groups.map((groupName) => {
    const perStore = weeklyTargetPerStoreByGroup[groupName] ?? 0;
    const storeCount = storesPerGroup[groupName] ?? 0;
    const target = perStore * storeCount;
    const achieved = achievedByGroup.get(groupName) ?? 0;
    const attainmentPct = target > 0 ? achieved / target : 0;

    const status = groupStatusFromAttainment(attainmentPct);

    return {
      groupId: groupName,
      groupName,
      achieved,
      target,
      attainmentPct,
      achievedLabel: String(achieved),
      targetLabel: String(target),
      attainmentLabel: `${Math.round(attainmentPct * 100)}%`,
      status,
    };
  });

  return {
    groupsWeekly: {
      period: 'weekly',
      weekLabel,
      window: { startISO: effectiveStart.toISO() ?? '', endISO: effectiveEnd.toISO() ?? '' },
      items,
    },
    metaAudit: {
      campaign: { startISO: campaignStart.toISO() ?? '', endISO: campaignEnd.toISO() ?? '' },
      groupsPeriod: 'weekly',
      weekWindow: {
        startISO: effectiveStart.toISO() ?? '',
        endISO: effectiveEnd.toISO() ?? '',
        weekLabel,
      },
      byGroup: groups.map((groupName) => {
        const perStore = weeklyTargetPerStoreByGroup[groupName] ?? 0;
        const storeCount = storesPerGroup[groupName] ?? 0;
        const target = perStore * storeCount;
        return {
          groupId: groupName,
          groupName,
          target,
          source: 'config/campaign.config.json:weeklyTargetPerStoreByGroup × lojas do grupo',
        };
      }),
    },
  };
}

function buildMonthlyStores(options: {
  proposals: ProposalFact[];
  tz: string;
  campaignStart: DateTime;
  campaignEnd: DateTime;
  now: DateTime;
  useFinalized: boolean;
}): { monthEnd: DateTime; stores: Array<{ label: string; value: string }>; monthTotal: number; windowLabel: string } {
  const { proposals, tz, campaignStart, campaignEnd, now, useFinalized } = options;
  const nowEff = effectiveNow(now, campaignStart, campaignEnd);

  const monthStart = campaignStart.startOf('day');
  const monthEnd = nowEff ? nowEff : monthStart.minus({ milliseconds: 1 });

  const totalsByStore = new Map<string, number>();
  let monthTotal = 0;

  if (nowEff) {
    for (const p of proposals) {
      const iso = approvalDateISO(p, useFinalized);
      if (!iso) continue;
      const dt = DateTime.fromISO(iso, { zone: tz }).startOf('day');
      if (!dt.isValid) continue;
      if (dt < monthStart) continue;
      if (dt > monthEnd) continue;

      const store = p.store || 'Loja';
      const approved = p.approved ?? 0;
      totalsByStore.set(store, (totalsByStore.get(store) ?? 0) + approved);
      monthTotal += approved;
    }
  }

  const stores = [...totalsByStore.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, total]) => ({ label, value: String(total) }));

  const label = `${monthStart.setLocale('pt-BR').toFormat('dd/LL')} até ${nowEff ? 'hoje' : 'início'}`;

  return { monthEnd, stores, monthTotal, windowLabel: label };
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

    const group = p.group || 'Sem Grupo';
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

function aggregateEvolution(proposals: ProposalFact[], options: { tz: string; useFinalized: boolean }): SeriesPoint[] {
  // Last 7 days (approved by day)
  const today = DateTime.now().setZone(options.tz).startOf('day');
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = today.minus({ days: 6 - i });
    return {
      iso: d.toISODate() as string,
      label: d.toFormat('dd/MM'),
    };
  });

  return days.map((d) => {
    const approved = proposals.reduce((sum, p) => {
      const iso = approvalDateISO(p, options.useFinalized);
      if (iso !== d.iso) return sum;
      return sum + (p.approved ?? 0);
    }, 0);
    return {
      day: d.label,
      value: approved
    };
  });
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

export function adaptSnapshotToCampaign(snapshot: unknown): SandboxData {
  const cfg = getCampaignConfig();
  const root = asRecord(snapshot);
  const editorialSummary = asRecord(root?.editorialSummary);

  const tzNow = DateTime.now().setZone(cfg.timezone);
  const campaignStart = DateTime.fromISO(cfg.campaignStartISO, { zone: cfg.timezone }).startOf('day');
  const campaignEnd = DateTime.fromISO(cfg.campaignEndISO, { zone: cfg.timezone }).endOf('day');

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

    const timeline = aggregateEvolution([], {
      tz: cfg.timezone,
      useFinalized: cfg.useFinalizedDateForApprovals,
    });

    const groupsWeekly = buildGroupsWeekly({
      proposals: [],
      storeMetrics: [],
      tz: cfg.timezone,
      campaignStart,
      campaignEnd,
      now: tzNow,
      useFinalized: cfg.useFinalizedDateForApprovals,
      weeklyTargetPerStoreByGroup: cfg.weeklyTargetPerStoreByGroup,
      storesPerGroup,
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
        storeList: [],
        timeline,
      },
      campaign: {
        groupsRadial: weeklyGoalsBase.map((g) => ({ group: g.group, score: 0 })),
        status: 'EM_DISPUTA',
        statusLabel: 'EM DISPUTA',
        nextAction: nextActionFromStatus('EM_DISPUTA'),
        ...groupsWeekly,
      },
      reengagement: reengagementFromStatus('EM_DISPUTA'),
      kpis: [
        { label: 'Aprovados (total)', value: '0' },
        { label: 'Digitados (total)', value: '0' },
        { label: 'Taxa de aprovação', value: '0%' },
        { label: 'Lojas ativas', value: String(Object.values(storesPerGroup).reduce((sum, n) => sum + n, 0)) },
      ],
      accumulated: { monthTotal: 0, label: 'Produção acumulada no mês', windowLabel: '01/12 até hoje', stores: [] },
    };
  }

  const heroObj = asRecord(editorialSummary.hero);
  const pulseObj = asRecord(editorialSummary.pulse);
  const totalsObj = asRecord(editorialSummary.totals);
  const comparatives = Array.isArray(editorialSummary.comparatives) ? editorialSummary.comparatives : [];
  const dod = comparatives.length > 0 && typeof comparatives[0] === 'object' ? (comparatives[0] as UnknownRecord) : null;

  const storeMetrics = Array.isArray(root.storeMetrics) ? (root.storeMetrics as StoreMetrics[]) : [];
  const proposals = Array.isArray(root.proposals) ? (root.proposals as ProposalFact[]) : [];

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

  // 2. Evolution (Timeline)
  const timeline = aggregateEvolution(proposals || [], { tz: cfg.timezone, useFinalized: cfg.useFinalizedDateForApprovals });

  // 3. Groups (Radial)
  // Re-use aggregation or specific map
  const groupsRadial = weeklyGoals.map((g) => {
    const ratio = g.target > 0 ? g.actual / g.target : 0;
    return { group: g.group, score: clampScore(Math.round(ratio * 100)) };
  });

  // 4. Comparison
  const approvedYesterday = safeNumber(pulseObj?.approvedYesterday, 0);
  const yesterdayResult = {
    value: approvedYesterday,
    label: 'Aprovados ontem',
    deltaText: Number.isFinite(safeNumber(dod?.approvedDeltaAbs, Number.NaN))
      ? `${safeNumber(dod?.approvedDeltaAbs, 0) >= 0 ? '+' : ''}${safeNumber(dod?.approvedDeltaAbs, 0)} vs dia anterior`
      : undefined,
  };

  const campaignStatus = normalizeStatus(safeString(heroObj?.statusLabel));

  const groupsWeekly = buildGroupsWeekly({
    proposals,
    storeMetrics,
    tz: cfg.timezone,
    campaignStart,
    campaignEnd,
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

  const byYesterday = [...storeMetrics].sort((a, b) => b.approvedYesterday - a.approvedYesterday);
  const podiumPicked = byYesterday.slice(0, 3).map((row) => ({
    label: row.store,
    value: `${row.approvedYesterday} aprov.`,
  }));
  const podium: SandboxData['movement']['podium'] = [
    podiumPicked[0] ?? { label: '—', value: '—' },
    podiumPicked[1] ?? { label: '—', value: '—' },
    podiumPicked[2] ?? { label: '—', value: '—' },
  ];

  const podiumLabels = new Set(podiumPicked.map((p) => p.label));
  const storeList = storeMetrics
    .filter((row) => !podiumLabels.has(row.store))
    .sort((a, b) => a.store.localeCompare(b.store))
    .map((row) => ({
      label: row.store,
      value: `${row.approvedYesterday} aprov.`,
    }));

  const explicitHeroSubheadline = safeString(heroObj?.subheadline, '');
  const fallbackHeroSubheadline = safeString(cfg.taglinePt, 'Leitura editorial do ritmo diário.');
  const heroSubheadline = heroSubheadlineFrom({
    status: campaignStatus,
    yesterdayApproved: approvedYesterday,
    dayKeyYesterday,
    fallback: fallbackHeroSubheadline,
  });

  const monthly = buildMonthlyStores({
    proposals,
    tz: cfg.timezone,
    campaignStart,
    campaignEnd,
    now: tzNow,
    useFinalized: cfg.useFinalizedDateForApprovals,
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
      storeList,
      timeline
    },
    campaign: {
      groupsRadial,
      status: campaignStatus,
      statusLabel: safeString(heroObj?.statusLabel, "EM DISPUTA"),
      nextAction: nextActionFromStatus(campaignStatus),
      ...groupsWeekly,
    },
    reengagement: reengagementFromStatus(campaignStatus),
    kpis: [
        { label: "Aprovados (total)", value: String(safeNumber(totalsObj?.approved, 0)) },
        { label: "Digitados (total)", value: String(safeNumber(totalsObj?.submitted, 0)) },
        { label: "Taxa de aprovação", value: `${Math.round(safeNumber(totalsObj?.approvalRate, 0) * 100)}%` },
        { label: "Lojas ativas", value: String(storeMetrics.length) }
    ],
    accumulated: {
        monthTotal: monthly.monthTotal > 0 ? monthly.monthTotal : safeNumber(totalsObj?.approved, 0),
        label: "Produção acumulada no mês",
        windowLabel: monthly.windowLabel,
        stores: monthly.stores,
    }
  };
}
