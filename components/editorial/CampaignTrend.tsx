import { ChartFrame } from '@/components/charts/ChartFrame';

type StatusLabel = 'NO JOGO' | 'EM DISPUTA' | 'FORA DO RITMO';

type TrendPoint = {
  dayKey: string;
  label: string;
  approved: number;
  target: number;
  trend: number;
};

type Props = {
  points: TrendPoint[];
  statusLabel: StatusLabel;
  title?: string;
  compact?: boolean;
};

function colorsForStatus(status: StatusLabel) {
  if (status === 'NO JOGO') return { line: '#15803d', target: '#d1d5db' };
  if (status === 'EM DISPUTA') return { line: '#b45309', target: '#d1d5db' };
  return { line: '#1d4ed8', target: '#d1d5db' };
}

export default function CampaignTrend({
  points,
  statusLabel,
  title = 'Producao diaria total',
  compact = false,
}: Props) {
  const width = 680;
  const height = 160;
  const padding = 16;
  const { line, target } = colorsForStatus(statusLabel);

  if (points.length < 2) {
    return (
      <div className="rounded-sm border border-black/10 bg-white p-6 md:p-8 shadow-sm">
        <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">{title}</div>
        <div className="mt-4 text-sm text-black/60">Sem dados suficientes para a linha.</div>
      </div>
    );
  }

  const showTarget = points.some((p) => p.target > 0);
  const values = showTarget ? points.flatMap((p) => [p.approved, p.target]) : points.map((p) => p.approved);
  const maxValue = Math.max(1, ...values);
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const step = chartWidth / (points.length - 1);

  const coords = points.map((p, i) => ({
    x: padding + i * step,
    yApproved: height - padding - (p.approved / maxValue) * chartHeight,
    yTarget: height - padding - (p.target / maxValue) * chartHeight,
  }));

  const pathFor = (key: 'yApproved' | 'yTarget') =>
    coords.reduce((acc, c, idx) => {
      if (idx === 0) return `M ${c.x} ${c[key]}`;
      return `${acc} L ${c.x} ${c[key]}`;
    }, '');

  const approvedPath = pathFor('yApproved');
  const targetPath = showTarget ? pathFor('yTarget') : '';

  return (
    <div className="rounded-sm border border-black/10 bg-white p-6 md:p-8 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">{title}</div>
      <div className="mt-4 min-w-0">
        <ChartFrame variant={compact ? 'compact' : 'home'}>
          <svg className="h-full w-full" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            <path d={approvedPath} fill="none" stroke={line} strokeWidth="1.8" strokeLinecap="round" />
            {showTarget ? (
              <path d={targetPath} fill="none" stroke={target} strokeWidth="1" strokeDasharray="4 4" />
            ) : null}
          </svg>
        </ChartFrame>
      </div>
      {showTarget ? (
        <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-black/45">— — Ritmo necessario</div>
      ) : null}
    </div>
  );
}
