export type CampaignStatus = 'NO_JOGO' | 'EM_DISPUTA' | 'FORA_DO_RITMO';

export type GroupRadialInput = {
  group: string;
  score: number;
  achievedLabel?: string;
  targetLabel?: string;
  attainmentLabel?: string;
  status?: CampaignStatus;
};

export type GroupsPulseVM = {
  statusLabel: string;
  statusPillClass: string;
  nextAction: string;
  weekLabel?: string;
  window?: { startISO: string; endISO: string };
  metaAudit?: {
    campaign: { startISO: string; endISO: string };
    groupsPeriod: 'weekly';
    weekWindow: { startISO: string; endISO: string; weekLabel: string };
    byGroup: Array<{ groupId: string; groupName: string; target: number; source: string }>;
  };
  cards: Array<{
    key: string;
    title: string;
    caption: string;
    delay: number;
    achievedLabel?: string;
    targetLabel?: string;
    attainmentLabel?: string;
    statusEmoji?: string;
    thermometer: {
      size: number;
      radius: number;
      circumference: number;
      offset: number;
      stroke: string;
      labelText: string;
      labelColor: string;
      cx: number;
      cy: number;
      strokeWidth: number;
    };
  }>;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function statusToPillClass(status: CampaignStatus): string {
  switch (status) {
    case 'NO_JOGO':
      return 'bg-emerald-500';
    case 'EM_DISPUTA':
      return 'bg-amber-500';
    case 'FORA_DO_RITMO':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}

function scoreToColor(score: number): string {
  if (score >= 90) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function statusToEmoji(status: CampaignStatus | undefined): string | undefined {
  if (!status) return undefined;
  if (status === 'NO_JOGO') return '🟢';
  if (status === 'FORA_DO_RITMO') return '🔴';
  return '🟡';
}

function shortGroupLabel(group: string): string {
  const cleaned = group.replace(/^grupo\s+/i, '').trim();
  if (cleaned) return cleaned;
  return group.trim().slice(0, 1).toUpperCase() || '-';
}

export function buildGroupsPulseVM(args: {
  groupsRadial: GroupRadialInput[];
  status: CampaignStatus;
  statusLabel: string;
  nextAction: string;
  weekLabel?: string;
  window?: { startISO: string; endISO: string };
  metaAudit?: GroupsPulseVM['metaAudit'];
  size?: number;
}): GroupsPulseVM {
  const size = args.size ?? 120;
  const strokeWidth = 8;

  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;

  const cards = args.groupsRadial.map((g, i) => {
    const score = clamp(g.score, 0, 100);
    const offset = circumference - (score / 100) * circumference;
    const stroke = scoreToColor(score);
    const label = shortGroupLabel(g.group);

    return {
      key: g.group,
      title: g.group,
      caption: 'Ritmo semanal',
      delay: i * 0.1,
      achievedLabel: g.achievedLabel,
      targetLabel: g.targetLabel,
      attainmentLabel: g.attainmentLabel,
      statusEmoji: statusToEmoji(g.status),
      thermometer: {
        size,
        radius,
        circumference,
        offset,
        stroke,
        labelText: label,
        labelColor: stroke,
        cx: size / 2,
        cy: size / 2,
        strokeWidth,
      },
    };
  });

  return {
    statusLabel: args.statusLabel,
    statusPillClass: statusToPillClass(args.status),
    nextAction: args.nextAction,
    weekLabel: args.weekLabel,
    window: args.window,
    metaAudit: args.metaAudit,
    cards,
  };
}
