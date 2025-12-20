type HeroLedgerProps = {
  approvedYesterday: number;
  targetToday: number;
  dayRatio: number;
  highlightStore?: string;
  highlightApproved?: number;
};

const numberFormatter = new Intl.NumberFormat('pt-BR');

function formatInt(value: number, fallback = '—') {
  if (!Number.isFinite(value)) return fallback;
  return numberFormatter.format(value);
}

function formatRatio(value: number, targetToday: number) {
  if (!Number.isFinite(value) || !Number.isFinite(targetToday) || targetToday <= 0) return '—';
  return `${value.toFixed(2).replace('.', ',')}x`;
}

export default function HeroLedger({
  approvedYesterday,
  targetToday,
  dayRatio,
  highlightStore,
  highlightApproved,
}: HeroLedgerProps) {
  const approvedLabel = formatInt(approvedYesterday);
  const targetLabel = targetToday > 0 ? formatInt(targetToday) : '—';
  const ratioLabel = formatRatio(dayRatio, targetToday);
  const highlightName = highlightStore?.trim() ? highlightStore : '—';
  const highlightApprovedLabel =
    typeof highlightApproved === 'number' && Number.isFinite(highlightApproved)
      ? `${formatInt(highlightApproved)} aprovadas`
      : '—';

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Meta do dia</div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">
            DayRatio do dia <span className="ml-2 font-semibold text-black/70 tabular-nums">{ratioLabel}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Aprovadas ontem (total)</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums">{approvedLabel}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Meta esperada do dia</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums">{targetLabel}</div>
          </div>
        </div>

        <div className="mt-4 rounded-sm border border-black/5 bg-stone-50 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-black/45">
          <div className="flex items-center justify-between">
            <span>Executado:</span>
            <span className="font-semibold text-black/80 tabular-nums">{approvedLabel}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Esperado:</span>
            <span className="font-semibold text-black/80 tabular-nums">{targetLabel}</span>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex h-full items-center justify-center">
          <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-black px-5 text-center text-white sm:h-48 sm:w-48">
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/70">DESTAQUE DO DIA</div>
            <div className="mt-2 text-xs font-semibold leading-tight sm:text-sm">{highlightName}</div>
            <div className="mt-2 text-base font-semibold tabular-nums sm:text-lg">{highlightApprovedLabel}</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/80">Parabéns!</div>
          </div>
        </div>
      </div>
    </section>
  );
}
