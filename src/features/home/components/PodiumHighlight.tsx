import type { PodiumItem } from '@/src/features/home/contracts/homeViewModel';

type PodiumHighlightProps = {
  title?: string;
  items: PodiumItem[];
};

export default function PodiumHighlight({
  title = 'Destaques do dia',
  items,
}: PodiumHighlightProps) {
  const slots: PodiumItem[] = items.slice(0, 3);
  while (slots.length < 3) {
    slots.push({ label: '-', value: '-' });
  }

  return (
    <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">{title}</div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {slots.map((item, idx) => {
          const isCenter = idx === 1;
          return (
            <div
              key={`${item.label}-${idx}`}
              className={`rounded-2xl border border-stone-200 bg-white p-4 text-center transition-transform ${
                isCenter ? 'md:-translate-y-1 md:scale-[1.03]' : ''
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400">
                <span>Loja</span>
                {item.stateBadge ? <span>{item.stateBadge}</span> : null}
              </div>
              <div className="mt-3 font-serif text-2xl text-stone-900">{item.label}</div>
              <div className="mt-2 text-sm text-stone-500">{item.value}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
