'use client';

export type StoreRankingItem = {
  label: string;
  value: string;
};

export type StoreRankingColumn = {
  title: string;
  items: StoreRankingItem[];
};

export default function StoreRankingColumns({
  columns,
  emptyLabel = 'Sem dados suficientes para listar lojas.',
}: {
  columns: StoreRankingColumn[];
  emptyLabel?: string;
}) {
  const visibleColumns = columns.filter((col) => col.items.length > 0);
  const anyItems = visibleColumns.length > 0;

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Demais lojas</div>

      {!anyItems ? (
        <div className="mt-4 text-sm text-black/55">{emptyLabel}</div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {visibleColumns.map((col) => (
            <div key={col.title} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">{col.title}</div>
              <div className="mt-4 space-y-2">
                {col.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-6 rounded-xl border border-black/5 bg-black/[0.02] px-4 py-2"
                  >
                    <div className="truncate text-xs text-black/70">{item.label}</div>
                    <div className="shrink-0 text-xs font-semibold tabular-nums text-black">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
