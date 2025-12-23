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
  const podium = {
    left: items[1] ?? { label: '—', value: '—' },
    center: items[0] ?? { label: '—', value: '—' },
    right: items[2] ?? { label: '—', value: '—' },
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">{title}</div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <PodiumCard item={podium.left} placement="left" />
        <PodiumCard item={podium.center} placement="center" />
        <PodiumCard item={podium.right} placement="right" />
      </div>
    </div>
  );
}

function PodiumCard({
  item,
  placement,
}: {
  item: PodiumHighlightItem;
  placement: 'left' | 'center' | 'right';
}) {
  const isCenter = placement === 'center';
  const aria = isCenter ? '1º lugar' : placement === 'left' ? '2º lugar' : '3º lugar';
  const Icon = isCenter ? Trophy : Medal;

  return (
    <div
      className={[
        'rounded-xl border border-black/10 bg-white p-5 shadow-sm',
        isCenter ? 'md:-translate-y-2 md:scale-[1.02]' : '',
      ].join(' ')}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="inline-flex items-center justify-center">
            <Icon
              aria-label={aria}
              role="img"
              className={isCenter ? 'h-5 w-5 text-black/80' : 'h-4 w-4 text-black/80 opacity-80'}
            />
          </span>
          <span className="text-xs uppercase tracking-widest text-black/55">{item.label}</span>
        </div>
      </div>
      <div className="mt-3 font-serif text-3xl tracking-tight text-black">{item.value}</div>
    </div>
  );
}
