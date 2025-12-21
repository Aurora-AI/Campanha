import type { StoreListItem } from '@/src/features/home/contracts/homeViewModel';

type StoreRankingListProps = {
  title?: string;
  emptyLabel?: string;
  items: StoreListItem[];
};

export default function StoreRankingList({
  title = 'Demais lojas',
  emptyLabel = 'Sem outras lojas no momento.',
  items,
}: StoreRankingListProps) {
  return (
    <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">{title}</div>

      {items.length === 0 ? (
        <div className="mt-4 text-sm text-stone-500">{emptyLabel}</div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item, idx) => (
            <div key={`${item.label}-${idx}`} className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-stone-800">{item.label}</span>
              <span className="text-stone-500">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
