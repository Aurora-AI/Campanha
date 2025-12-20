type StatusLabel = 'NO JOGO' | 'EM DISPUTA' | 'FORA DO RITMO';

type Props = {
  approvedYesterday: number;
  targetToday: number;
  dayRatio: number;
  statusLabel: StatusLabel;
  size?: number;
  stroke?: number;
  label?: string;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function colorsForStatus(status: StatusLabel) {
  if (status === 'NO JOGO') return { base: '#22c55e', glow: '#86efac' };
  if (status === 'EM DISPUTA') return { base: '#f59e0b', glow: '#fde68a' };
  return { base: '#3b82f6', glow: '#93c5fd' };
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

function formatNumber(value: number, fallback = '—') {
  if (!Number.isFinite(value)) return fallback;
  return numberFormatter.format(value);
}

export default function DailyDonut({
  approvedYesterday,
  targetToday,
  dayRatio,
  statusLabel,
  size = 180,
  stroke = 18,
  label = 'Meta diaria',
}: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const hasTarget = Number.isFinite(targetToday) && targetToday > 0;
  const progress = hasTarget && Number.isFinite(dayRatio) ? clamp(dayRatio) : 0;
  const dash = circumference * progress;
  const { base, glow } = colorsForStatus(statusLabel);
  const gradientId = `donut-${statusLabel.replace(/\s+/g, '-').toLowerCase()}`;
  const compact = size <= 150;
  const approvedLabel = formatNumber(approvedYesterday);
  const targetLabel = hasTarget ? formatNumber(targetToday) : '—';

  return (
    <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">{label}</div>
      <div className="relative mt-6 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <defs>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={glow} stopOpacity="0.55" />
              <stop offset="70%" stopColor={base} stopOpacity="0.85" />
              <stop offset="100%" stopColor={base} stopOpacity="0.85" />
            </radialGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>

        <div className="absolute text-center">
          <div className={compact ? 'text-3xl font-semibold tabular-nums' : 'text-4xl font-semibold tabular-nums'}>
            {approvedLabel}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-black/45">aprovadas ontem</div>
        </div>
      </div>

      <div className={compact ? 'mt-4 text-center text-xs text-black/60' : 'mt-5 text-center text-sm text-black/60'}>
        Meta esperada: <span className="text-black/80 tabular-nums">{targetLabel}</span>
      </div>
    </div>
  );
}
