import { DateTime } from 'luxon';
import { getCampaignConfig, countStoresByGroup } from '@/lib/campaign/config';
import { buildGroupsPulseVM } from '@/lib/viewmodels/groupsPulse.vm';
import type { ProposalFact, StoreMetrics } from '@/lib/analytics/types';
import type {
  CampaignStatus,
  HighlightBlock,
  HomeViewModel,
  PodiumItem,
  StoreListItem,
} from '@/src/features/home/contracts/homeViewModel';

type AnyObj = Record<string, unknown>;

function asRecord(input: unknown): AnyObj | null {
  return input && typeof input === 'object' ? (input as AnyObj) : null;
}

function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatCount(value: number, fallback = '-'): string {
  if (!Number.isFinite(value)) return fallback;
  return Math.round(value).toString();
}

function formatPercent(value: number, fallback = '-'): string {
  if (!Number.isFinite(value)) return fallback;
  const pct = value <= 1 ? value * 100 : value;
  return `${Math.round(pct)}%`;
}

function normalizeStatus(input: string): CampaignStatus {
  const raw = safeString(input, '').toUpperCase();
  if (raw.includes('NO') && raw.includes('JOGO')) return 'NO_JOGO';
  if (raw.includes('FORA') && raw.includes('RITMO')) return 'FORA_DO_RITMO';
  if (raw.includes('EM') && raw.includes('DISPUTA')) return 'EM_DISPUTA';
  return 'EM_DISPUTA';
}

function statusLabelText(status: CampaignStatus): string {
  switch (status) {
    case 'NO_JOGO':
      return 'NO JOGO';
    case 'FORA_DO_RITMO':
      return 'FORA DO RITMO';
    default:
      return 'EM DISPUTA';
  }
}

function statusEmoji(status: CampaignStatus): string {
  switch (status) {
    case 'NO_JOGO':
      return '🟢';
    case 'FORA_DO_RITMO':
      return '🔴';
    default:
      return '🟡';
  }
}

function statusLabelWithEmoji(status: CampaignStatus): string {
  return `${statusEmoji(status)} ${statusLabelText(status)}`;
}

function approvalDateISO(p: ProposalFact, useFinalized: boolean): string | null {
  return useFinalized ? p.finalizedDateISO ?? p.entryDateISO : p.entryDateISO;
}

function buildTimeline(
  proposals: ProposalFact[],
  tz: string,
  useFinalized: boolean
): Array<{ day: string; value: number }> {
  const today = DateTime.now().setZone(tz);
  const days = Array.from({ length: 7 }, (_, i) => today.minus({ days: 6 - i }).startOf('day'));

  return days.map((d) => {
    const iso = d.toISODate() ?? '';
    let approved = 0;
    for (const p of proposals) {
      const key = approvalDateISO(p, useFinalized);
      if (key === iso) approved += p.approved ?? 0;
    }
    return { day: d.toFormat('dd/MM'), value: approved };
  });
}

function deltaTextFromTimeline(timeline: Array<{ day: string; value: number }>): string | undefined {
  if (timeline.length < 2) return undefined;
  const last = timeline[timeline.length - 1]?.value ?? 0;
  const prev = timeline[timeline.length - 2]?.value ?? 0;
  const delta = last - prev;
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta} vs dia anterior`;
}

function buildWeeklyGoals(
  storeMetrics: StoreMetrics[],
  cfg: ReturnType<typeof getCampaignConfig>
): HomeViewModel['cover']['weeklyGoals'] {
  const actualByGroup = new Map<string, number>();
  for (const row of storeMetrics) {
    const group = safeString(row.group, 'Sem Grupo');
    actualByGroup.set(group, (actualByGroup.get(group) ?? 0) + safeNumber(row.approvedTotal, 0));
  }

  const targetByGroup = cfg.weeklyTargetPerStoreByGroup || {};
  const counts = countStoresByGroup(cfg);
  const orderedGroups = Object.keys(targetByGroup);
  const groups = orderedGroups.length > 0 ? [...orderedGroups] : [];

  for (const group of actualByGroup.keys()) {
    if (!groups.includes(group)) groups.push(group);
  }

  if (groups.length === 0) {
    groups.push('Grupo A', 'Grupo B', 'Grupo C');
  }

  return groups.map((group) => {
    const target = safeNumber(targetByGroup[group], 0) * safeNumber(counts[group], 0);
    const actual = safeNumber(actualByGroup.get(group), 0);
    const tone = target > 0 && actual >= target ? 'good' : 'warn';
    return { group, target, actual, tone };
  });
}

function buildRankedStores(storeMetrics: StoreMetrics[]): Array<{ label: string; value: number }> {
  if (!storeMetrics.length) return [];

  const hasYesterday = storeMetrics.some((row) => safeNumber(row.approvedYesterday, 0) > 0);
  const key: 'approvedYesterday' | 'approvedTotal' = hasYesterday ? 'approvedYesterday' : 'approvedTotal';

  return [...storeMetrics]
    .map((row) => ({
      label: safeString(row.store, 'Loja'),
      value: safeNumber(row[key], 0),
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function formatApprovedValue(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '-';
  return `${formatCount(value)} aprov.`;
}

function ensurePodium(items: Array<{ label: string; value: number }>): PodiumItem[] {
  const out: PodiumItem[] = [];
  for (let i = 0; i < 3; i += 1) {
    const item = items[i];
    if (item) {
      out.push({ label: item.label, value: formatApprovedValue(item.value) });
    } else {
      out.push({ label: '-', value: '-' });
    }
  }
  return out;
}

function buildStoreList(items: Array<{ label: string; value: number }>): StoreListItem[] {
  if (items.length <= 3) return [];
  return items.slice(3).map((item) => ({
    label: item.label,
    value: formatApprovedValue(item.value),
  }));
}

function nextActionForStatus(status: CampaignStatus): string {
  if (status === 'NO_JOGO') return 'Sustente o ritmo e destrave pendencias com foco.';
  if (status === 'EM_DISPUTA') return 'Atue nas pendencias dominantes para recuperar o ritmo hoje.';
  return 'Priorize destravar pendencias e retomadas imediatamente.';
}

function highlightTone(deltaAbs: number | null | undefined): HighlightBlock['tone'] {
  if (deltaAbs == null || !Number.isFinite(deltaAbs)) return 'neutral';
  if (deltaAbs > 0) return 'positive';
  if (deltaAbs < 0) return 'negative';
  return 'neutral';
}

export function buildHomeViewModel(snapshot: unknown): HomeViewModel {
  const cfg = getCampaignConfig();
  const root = asRecord(snapshot) ?? {};
  const summary = asRecord(root.editorialSummary) ?? {};
  const hero = asRecord(summary.hero) ?? {};
  const pulse = asRecord(summary.pulse) ?? {};
  const totals = asRecord(summary.totals) ?? {};
  const dailyResult = asRecord(summary.dailyResult) ?? {};
  const comparatives = Array.isArray(summary.comparatives) ? summary.comparatives : [];

  const proposals = Array.isArray(root.proposals) ? (root.proposals as ProposalFact[]) : [];
  const storeMetrics = Array.isArray(root.storeMetrics) ? (root.storeMetrics as StoreMetrics[]) : [];

  const headline = safeString(hero.headline, cfg.campaignName);
  const subtitle = safeString(hero.subheadline, cfg.taglinePt);

  const rawStatusLabel = safeString(dailyResult.statusLabel ?? hero.statusLabel, 'EM DISPUTA');
  const status = normalizeStatus(rawStatusLabel);
  const statusLabel = statusLabelWithEmoji(status);

  const useFinalized = cfg.useFinalizedDateForApprovals;
  const timeline = buildTimeline(proposals, cfg.timezone, useFinalized);
  const timelineDeltaText = deltaTextFromTimeline(timeline);

  const approvedYesterday = safeNumber(
    pulse.approvedYesterday,
    timeline.length > 0 ? safeNumber(timeline[timeline.length - 1].value, 0) : 0
  );

  const weeklyGoals = buildWeeklyGoals(storeMetrics, cfg);
  const groupsRadial = weeklyGoals.map((g) => ({
    group: g.group,
    score: g.target > 0 ? Math.round((g.actual / g.target) * 100) : 0,
  }));

  const rankedStores = buildRankedStores(storeMetrics);
  const podium = ensurePodium(rankedStores);
  const storeList = buildStoreList(rankedStores);

  const leader = podium[0] ?? { label: '-', value: '-' };

  const comparative = comparatives.length > 0 ? asRecord(comparatives[0]) : null;
  const approvedDeltaAbs = comparative ? safeNumber(comparative.approvedDeltaAbs, 0) : null;

  const deltaText =
    safeString(hero.deltaText, '') ||
    (comparative
      ? `${approvedDeltaAbs != null && approvedDeltaAbs >= 0 ? '+' : ''}${approvedDeltaAbs ?? 0} vs dia anterior`
      : '') ||
    timelineDeltaText;

  const summaryValue = formatCount(approvedYesterday, '-');
  const summaryLabel = safeString(hero.kpiLabel, 'Aprovados ontem');

  const campaign = buildGroupsPulseVM({
    groupsRadial,
    status,
    statusLabel,
    nextAction: nextActionForStatus(status),
    size: 120,
  });

  const approvedDeltaText =
    approvedDeltaAbs == null
      ? undefined
      : `${approvedDeltaAbs >= 0 ? '+' : ''}${approvedDeltaAbs} vs dia anterior`;

  const highlights: HighlightBlock[] = [
    {
      label: 'Aprovados',
      value: formatCount(safeNumber(totals.approved, 0), '-'),
      deltaText: approvedDeltaText,
      tone: highlightTone(approvedDeltaAbs),
    },
    {
      label: 'Digitados',
      value: formatCount(safeNumber(totals.submitted, 0), '-'),
    },
    {
      label: 'Taxa de aprovacao',
      value: formatPercent(safeNumber(totals.approvalRate, 0), '-'),
    },
  ];

  return {
    podium,
    storeList,
    cover: {
      headline,
      subtitle,
      state: status,
      stateLabel: statusLabel,
      leaderValue: leader.value,
      leaderLabel: leader.label,
      deltaText: deltaText || undefined,
      cta: { label: 'Ver detalhes', href: '/dashboard' },
      weeklyGoals,
      yesterdayApproved: {
        value: approvedYesterday,
        label: summaryLabel,
      },
    },
    movement: {
      title: 'Resultado do dia',
      subtitle: 'Evolucao diaria e leitura de contexto.',
      summary: {
        label: summaryLabel,
        value: summaryValue,
        deltaText: deltaText || undefined,
      },
      timeline,
    },
    campaign,
    spread: {
      left: {
        bullets: [
          `Lider do dia: ${leader.label}`,
          `Aprovados ontem: ${summaryValue}`,
          `Estado: ${statusLabel}`,
        ],
      },
      right: {
        nextActionTitle: 'Proxima acao',
        nextActionReason: campaign.nextAction,
        href: '/dashboard',
        contestable: status !== 'NO_JOGO',
      },
    },
    highlights,
    reengagement: {
      title: 'Ruptura do dia',
      subtitle: 'Recupere oportunidades criticas e mantenha o ritmo ativo.',
      ctaLabel: 'Ver oportunidades',
    },
    accumulated: {
      monthTotal: safeNumber(totals.approved, 0),
      label: 'Producao mensal acumulada',
      note: 'Leitura de fechamento do periodo.',
    },
    archive: {
      links: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Grupos', href: '/groups' },
        { label: 'Lojas', href: '/stores' },
      ],
    },
  };
}
