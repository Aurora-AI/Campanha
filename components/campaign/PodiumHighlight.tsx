'use client';

import { Medal, Trophy } from 'lucide-react';

export type PodiumHighlightItem = {
  label: string;
  value: string;
};

export default function PodiumHighlight({
  title = 'Destaques do dia',
  items,
}: {
  title?: string;
  items: PodiumHighlightItem[];
}) {
  const slots: PodiumHighlightItem[] = [
    items[0] ?? { label: '—', value: '—' },
    items[1] ?? { label: '—', value: '—' },
    items[2] ?? { label: '—', value: '—' },
  ];

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">{title}</div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {slots.map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className={[
              'rounded-xl border border-black/10 bg-white p-5 shadow-sm',
              idx === 1 ? 'md:-translate-y-2 md:scale-[1.02]' : '',
            ].join(' ')}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="inline-flex items-center justify-center">
                  {idx === 0 ? (
                    <Trophy aria-label="1º lugar" role="img" className="h-5 w-5 text-black/80" />
                  ) : (
                    <Medal
                      aria-label={idx === 1 ? '2º lugar' : '3º lugar'}
                      role="img"
                      className={['h-4 w-4 text-black/80', idx === 1 ? 'opacity-90' : 'opacity-75'].join(' ')}
                    />
                  )}
                </span>
                <span className="text-xs uppercase tracking-widest text-black/55">{item.label}</span>
              </div>
            </div>
            <div className="mt-3 font-serif text-3xl tracking-tight text-black">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
