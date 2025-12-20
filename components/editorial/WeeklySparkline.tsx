type StatusLabel = 'NO JOGO' | 'EM DISPUTA' | 'FORA DO RITMO';

type TrendPoint = {
  dayKey: string;
  label: string;
  approved: number;
};

type Props = {
  points: TrendPoint[];
  targetToday: number;
  statusLabel: StatusLabel;
};

function colorsForStatus(status: StatusLabel) {
  if (status === 'NO JOGO') return { base: '#22c55e', fill: '#86efac' };
  if (status === 'EM DISPUTA') return { base: '#f59e0b', fill: '#fde68a' };
  return { base: '#3b82f6', fill: '#93c5fd' };
}

export default function WeeklySparkline({ points, targetToday, statusLabel }: Props) {
  const width = 520;
  const height = 140;
  const padding = 16;
  const values = points.map((p) => p.approved);
  const { base, fill } = colorsForStatus(statusLabel);

  if (!points.length) {
    return (
      <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
        <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Tendência semanal</div>
        <div className="mt-6 text-sm text-black/60">Sem dados suficientes para a semana.</div>
      </div>
    );
  }

  const maxValue = Math.max(1, targetToday, ...values);
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const step = points.length > 1 ? chartWidth / (points.length - 1) : 0;

  const coords = values.map((v, i) => {
    const x = padding + i * step;
    const y = height - padding - (v / maxValue) * chartHeight;
    return { x, y };
  });

  const linePath = coords.reduce((acc, c, idx) => {
    if (idx === 0) return `M ${c.x} ${c.y}`;
    return `${acc} L ${c.x} ${c.y}`;
  }, '');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${
    height - padding
  } Z`;

  const targetY = height - padding - (targetToday / maxValue) * chartHeight;
  const gradientId = `spark-${statusLabel.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Tendência semanal</div>
      <div className="mt-5 overflow-hidden">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={fill} stopOpacity="0.12" />
              <stop offset="100%" stopColor={fill} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <line
            x1={padding}
            x2={width - padding}
            y1={targetY}
            y2={targetY}
            stroke="#d1d5db"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <path d={linePath} fill="none" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-black/45">— — Meta diária</div>
    </div>
  );
}
