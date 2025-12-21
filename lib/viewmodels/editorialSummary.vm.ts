export type CampaignStatus = 'NO_JOGO' | 'EM_DISPUTA' | 'FORA_DO_RITMO';

export type EditorialSummaryVM = {
  updatedAtISO: string;

  hero: {
    kpiLabel: string;
    kpiValue: string;
    deltaText?: string;
    status: CampaignStatus;
    statusLabel: string;
  };

  headline: {
    title: string;
    subtitle: string;
  };

  highlights: Array<{
    label: string;
    value: string;
    note?: string;
  }>;

  top3: Array<{
    rank: 1 | 2 | 3;
    name: string;
    value: string;
    delta?: string;
  }>;
};

type AnyObj = Record<string, any>;

function asRecord(input: unknown): AnyObj | null {
  return input && typeof input === 'object' ? (input as AnyObj) : null;
}

function toISODateFallback(input: any): string {
  if (typeof input === 'string' && input.length >= 10) return input;
  try {
    return new Date().toISOString();
  } catch {
    return '1970-01-01T00:00:00.000Z';
  }
}

function safeNumber(n: any, fallback = 0): number {
  const x = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(x) ? x : fallback;
}

function safeString(s: any, fallback = ''): string {
  return typeof s === 'string' && s.trim().length > 0 ? s : fallback;
}

function normalizeStatus(input: any): CampaignStatus {
  const raw = safeString(input, '').toUpperCase();

  if (raw.includes('NO') && raw.includes('JOGO')) return 'NO_JOGO';
  if (raw.includes('EM') && raw.includes('DISPUTA')) return 'EM_DISPUTA';
  if (raw.includes('FORA') && raw.includes('RITMO')) return 'FORA_DO_RITMO';

  return 'EM_DISPUTA';
}

function statusLabelPT(status: CampaignStatus): string {
  switch (status) {
    case 'NO_JOGO':
      return 'NO JOGO';
    case 'EM_DISPUTA':
      return 'EM DISPUTA';
    case 'FORA_DO_RITMO':
      return 'FORA DO RITMO';
    default:
      return 'EM DISPUTA';
  }
}

function formatCount(value: number): string {
  if (!Number.isFinite(value)) return '-';
  return Math.round(value).toString();
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '';
  const pct = value <= 1 ? value * 100 : value;
  return `${Math.round(pct)}%`;
}

function pickLatestWeek(weeks: AnyObj | null): AnyObj | null {
  if (!weeks) return null;
  const entries = Object.entries(weeks);
  if (entries.length === 0) return null;

  let best: AnyObj | null = null;
  let bestTs = Number.NEGATIVE_INFINITY;

  for (const [key, week] of entries) {
    const weekObj = asRecord(week);
    const id = safeString(weekObj?.weekId ?? key, '');
    const ts = Date.parse(id);
    if (Number.isFinite(ts) && ts >= bestTs) {
      best = weekObj ?? null;
      bestTs = ts;
    }
  }

  if (best) return best;
  const fallback = asRecord(entries[0]?.[1]);
  return fallback ?? null;
}

export function buildEditorialSummaryVM(snapshot: AnyObj | null | undefined): EditorialSummaryVM {
  const root = asRecord(snapshot) ?? {};
  const data = asRecord(root.data) ?? root;
  const metrics = asRecord(data.metrics) ?? asRecord(root.metrics);
  const headline = asRecord(metrics?.headline) ?? asRecord(root.headline);
  const campaign = asRecord(data.campaign) ?? asRecord(root.campaign);

  const updatedAtISO = toISODateFallback(
    root.updatedAtISO ?? root.updatedAt ?? root.publishedAt ?? data.updatedAtISO ?? data.updatedAt ?? data.publishedAt
  );

  const approvals = safeNumber(
    headline?.totalApproved ??
      headline?.approved ??
      headline?.approvals ??
      metrics?.approved ??
      metrics?.totalApproved ??
      metrics?.aprovadas ??
      campaign?.approved ??
      campaign?.approvals ??
      campaign?.aprovadas,
    0
  );

  const dailyEvolution = Array.isArray(metrics?.dailyEvolution)
    ? (metrics?.dailyEvolution as AnyObj[])
    : Array.isArray(headline?.dailyEvolution)
      ? (headline?.dailyEvolution as AnyObj[])
      : [];

  const lastDay = dailyEvolution[dailyEvolution.length - 1];
  const prevDay = dailyEvolution[dailyEvolution.length - 2];
  const lastApproved = safeNumber(lastDay?.approved ?? lastDay?.value ?? lastDay?.count, 0);
  const prevApproved = safeNumber(prevDay?.approved ?? prevDay?.value ?? prevDay?.count, 0);

  let deltaText: string | undefined;
  if (dailyEvolution.length >= 2) {
    const delta = lastApproved - prevApproved;
    deltaText = `${delta >= 0 ? '+' : ''}${delta} vs dia anterior`;
  } else {
    const deltaAbs = safeNumber(headline?.deltaVsPrevDay?.abs ?? headline?.deltaAbs, Number.NaN);
    if (Number.isFinite(deltaAbs)) {
      deltaText = `${deltaAbs >= 0 ? '+' : ''}${deltaAbs} vs dia anterior`;
    } else {
      deltaText =
        safeString(
          campaign?.leaderDeltaText ?? campaign?.deltaText ?? metrics?.deltaText ?? headline?.deltaText,
          ''
        ) || undefined;
    }
  }

  const rawStatus = safeString(
    campaign?.status ?? campaign?.statusLabel ?? metrics?.status ?? headline?.status ?? headline?.statusLabel,
    ''
  );

  const derivedStatus =
    dailyEvolution.length === 0
      ? undefined
      : lastApproved <= 0
        ? 'FORA_DO_RITMO'
        : dailyEvolution.length >= 2 && lastApproved - prevApproved < 0
          ? 'EM_DISPUTA'
          : 'NO_JOGO';

  const status: CampaignStatus = rawStatus ? normalizeStatus(rawStatus) : derivedStatus ?? 'EM_DISPUTA';
  const statusLabel = safeString(
    campaign?.statusLabel ?? headline?.statusLabel ?? metrics?.statusLabel,
    statusLabelPT(status)
  );

  const top3Candidate =
    (Array.isArray(campaign?.top3) && campaign?.top3) ||
    (Array.isArray(metrics?.top3) && metrics?.top3) ||
    (Array.isArray(asRecord(metrics?.leaderboard)?.top3) && asRecord(metrics?.leaderboard)?.top3) ||
    [];

  const weeks = asRecord(metrics?.weeks);
  const latestWeek = pickLatestWeek(weeks);
  const groupsObj = asRecord(latestWeek?.groups) ?? asRecord(metrics?.groups);
  const groups = groupsObj ? Object.values(groupsObj) : [];

  const groupsSorted = groups
    .map((g) => {
      const gObj = asRecord(g) ?? {};
      const approvedCount = safeNumber(gObj.approved ?? gObj.value ?? gObj.total ?? gObj.count, 0);
      const goalCount = safeNumber(gObj.groupGoal ?? gObj.goal ?? gObj.target, 0);
      const name = safeString(gObj.name ?? gObj.label ?? gObj.group ?? gObj.groupName ?? gObj.id, '');
      return { approvedCount, goalCount, name };
    })
    .sort((a, b) => b.approvedCount - a.approvedCount);

  const computedTop3 = groupsSorted.slice(0, 3).map((g) => {
    const value = g.goalCount > 0 ? `${formatPercent(g.approvedCount / g.goalCount)} da meta` : `${formatCount(g.approvedCount)} aprov.`;
    return { name: g.name, value, approvedCount: g.approvedCount };
  });

  const top3Base = top3Candidate.length > 0 ? top3Candidate : computedTop3;

  const top3 = ([1, 2, 3] as const).map((rank, index) => {
    const row = asRecord(top3Base[index]) ?? {};
    const name = safeString(
      row.name ?? row.label ?? row.group ?? row.store ?? row.groupName ?? row.id,
      `#${rank}`
    );

    let value = safeString(row.value, '');
    if (!value) {
      const pct = safeNumber(row.pct ?? row.percent ?? row.pctOfGoal, Number.NaN);
      if (Number.isFinite(pct)) value = `${formatPercent(pct)} da meta`;
    }
    if (!value) {
      const approvedCount = safeNumber(row.approved ?? row.count ?? row.total, Number.NaN);
      if (Number.isFinite(approvedCount) && approvedCount > 0) {
        value = `${formatCount(approvedCount)} aprov.`;
      }
    }
    if (!value && typeof row.value === 'number') {
      value = formatCount(row.value);
    }
    if (!value) value = '-';

    const delta = safeString(row.delta ?? row.deltaText, '') || undefined;
    return { rank, name, value, delta };
  });

  const leaderName = safeString(
    campaign?.leader?.name ??
      campaign?.leaderName ??
      campaign?.highlights?.leader ??
      top3[0]?.name ??
      computedTop3[0]?.name,
    '-'
  );

  const leaderGap =
    groupsSorted.length >= 2 ? groupsSorted[0].approvedCount - groupsSorted[1].approvedCount : null;
  const leaderGapNote =
    leaderGap && leaderGap > 0 ? `+${formatCount(leaderGap)} acima do 2o` : undefined;

  const leaderNote =
    safeString(campaign?.leader?.note ?? campaign?.leaderNote, '') || leaderGapNote;

  const headlineTitle = safeString(campaign?.headline?.title ?? root?.headline?.title, 'Resumo da campanha');
  const headlineSubtitle = safeString(
    campaign?.headline?.subtitle ?? root?.headline?.subtitle,
    'Indicadores do ultimo processamento do CSV.'
  );

  const highlights: EditorialSummaryVM['highlights'] = [
    {
      label: 'Indicador principal',
      value: approvals > 0 ? `${formatCount(approvals)} aprovacoes` : '-',
      note: deltaText,
    },
    {
      label: 'Lider do momento',
      value: leaderName,
      note: leaderNote,
    },
    {
      label: 'Status da campanha',
      value: statusLabel,
    },
  ];

  return {
    updatedAtISO,
    hero: {
      kpiLabel: 'Aprovacoes',
      kpiValue: approvals > 0 ? `${formatCount(approvals)}` : '-',
      deltaText,
      status,
      statusLabel,
    },
    headline: {
      title: headlineTitle,
      subtitle: headlineSubtitle,
    },
    highlights,
    top3,
  };
}
