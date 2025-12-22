'use client';

export type StoreListItem = {
  label: string;
  value: string;
};

export default function StoreList({
  title = 'Demais lojas',
  items,
  emptyLabel = 'Sem dados suficientes para listar lojas.',
}: {
  title?: string;
  items: StoreListItem[];
  emptyLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">{title}</div>

      {items.length === 0 ? (
        <div className="mt-4 text-sm text-black/55">{emptyLabel}</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-6 rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3"
            >
              <div className="truncate text-sm text-black/70">{item.label}</div>
              <div className="shrink-0 font-serif text-lg text-black">{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
