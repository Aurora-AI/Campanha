'use client';

import { useMemo, useState } from 'react';

type Row = {
  store: string;
  approvedYesterday: number;
  targetToday: number;
  dayRatio: number;
};

type Props = {
  rows: Row[];
};

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function StoreProductionCard({ rows }: Props) {
  const [mode, setMode] = useState<'abs' | 'pct'>('abs');

  const maxApproved = useMemo(() => {
    if (!rows.length) return 1;
    return Math.max(1, ...rows.map((r) => r.approvedYesterday));
  }, [rows]);

  return (
    <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Producao por Loja</div>
          <div className="mt-2 text-sm text-black/60">Leitura operacional do dia.</div>
        </div>

        <div className="flex items-center rounded-full border border-black/10 bg-white p-1 text-[10px] uppercase tracking-[0.22em]">
          <button
            onClick={() => setMode('abs')}
            className={mode === 'abs' ? 'rounded-full bg-black px-3 py-1 text-white' : 'px-3 py-1 text-black/45'}
          >
            Resultado
          </button>
          <button
            onClick={() => setMode('pct')}
            className={mode === 'pct' ? 'rounded-full bg-black px-3 py-1 text-white' : 'px-3 py-1 text-black/45'}
          >
            % Meta
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {rows.length === 0 ? (
          <div className="text-sm text-black/60">Sem dados de ontem para exibir.</div>
        ) : (
          rows.map((row, idx) => {
            const ratio = maxApproved > 0 ? row.approvedYesterday / maxApproved : 0;
            const width = ratio > 0 ? Math.max(6, Math.round(ratio * 100)) : 0;
            const value =
              mode === 'abs'
                ? row.approvedYesterday
                : row.targetToday > 0
                  ? pct(row.dayRatio)
                  : '-';

            return (
              <div key={row.store} className="grid grid-cols-[auto,1fr,auto] items-center gap-4">
                <div className="text-xs text-black/45">{idx + 1}.</div>
                <div>
                  <div className="text-sm font-medium">{row.store}</div>
                  <div className="mt-2 h-2 w-full rounded-full bg-black/5">
                    <div className="h-2 rounded-full bg-black/20" style={{ width: `${width}%` }} />
                  </div>
                </div>
                <div className="text-right text-sm font-semibold tabular-nums">{value}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
