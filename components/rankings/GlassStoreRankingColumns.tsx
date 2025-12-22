'use client';

import * as React from 'react';
import { GlassStoreRanking, type GlassStoreRankingRow } from '@/components/rankings/GlassStoreRanking';
import type { StoreRankingColumn } from '@/components/campaign/StoreRankingColumns';

function parseApprovedCount(value: string): number {
  const m = value.match(/\d+/);
  if (!m) return 0;
  const n = Number.parseInt(m[0], 10);
  return Number.isFinite(n) ? n : 0;
}

export default function GlassStoreRankingColumns({
  columns,
  emptyLabel = 'Sem dados suficientes para listar lojas.',
}: {
  columns: StoreRankingColumn[];
  emptyLabel?: string;
}) {
  const visibleColumns: StoreRankingColumn[] = [];
  for (const col of columns) {
    if (col.items.length > 0) visibleColumns.push(col);
  }

  if (visibleColumns.length === 0) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Demais lojas</div>
        <div className="mt-4 text-sm text-black/55">{emptyLabel}</div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-gradient-to-b from-neutral-950 to-neutral-900 p-6 shadow-xl">
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Demais lojas</div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {visibleColumns.map((col) => {
          const rows: GlassStoreRankingRow[] = [];
          for (let i = 0; i < col.items.length; i++) {
            const item = col.items[i];
            rows.push({
              id: `${col.title}::${i}`,
              storeLabel: item.label,
              approved: parseApprovedCount(item.value),
            });
          }

          return <GlassStoreRanking key={col.title} title={col.title} rows={rows} />;
        })}
      </div>
    </div>
  );
}

