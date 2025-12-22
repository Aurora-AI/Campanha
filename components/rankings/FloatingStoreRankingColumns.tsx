'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { StoreRankingColumn } from '@/components/campaign/StoreRankingColumns';

export default function FloatingStoreRankingColumns({
  columns,
  emptyLabel = 'Sem dados suficientes para listar lojas.',
}: {
  columns: StoreRankingColumn[];
  emptyLabel?: string;
}) {
  const reduceMotion = useReducedMotion();

  const visibleColumns: StoreRankingColumn[] = [];
  for (const col of columns) {
    if (col.items.length > 0) visibleColumns.push(col);
  }

  if (visibleColumns.length === 0) {
    return <div className="mt-4 text-sm text-black/55">{emptyLabel}</div>;
  }

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={reduceMotion ? undefined : { duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-[10px] uppercase tracking-[0.28em] text-black/35">Demais lojas</div>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {visibleColumns.map((col) => (
          <div key={col.title} className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">{col.title}</div>
            <div className="mt-4 space-y-3">
              {col.items.map((item) => (
                <div key={item.label} className="flex items-baseline justify-between gap-6">
                  <div className="min-w-0 truncate text-[13px] tracking-[0.01em] text-black/70">
                    {item.label}
                  </div>
                  <div className="shrink-0 text-[12px] tabular-nums tracking-[0.14em] text-black/55">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

