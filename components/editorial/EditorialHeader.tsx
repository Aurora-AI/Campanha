type Props = {
  headline: string;
  subheadline: string;
  statusLabel: 'NO JOGO' | 'EM DISPUTA' | 'FORA DO RITMO';
};

export default function EditorialHeader({ headline, subheadline, statusLabel }: Props) {
  const color =
    statusLabel === 'NO JOGO'
      ? 'bg-emerald-600'
      : statusLabel === 'EM DISPUTA'
        ? 'bg-amber-500'
        : 'bg-rose-600';

  return (
    <header className="mt-10">
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-white ${color}`}>
          {statusLabel}
        </span>
      </div>

      <h2 className="mt-6 text-4xl font-semibold tracking-tight">{headline}</h2>
      <p className="mt-3 max-w-2xl text-sm text-black/60">{subheadline}</p>
    </header>
  );
}
