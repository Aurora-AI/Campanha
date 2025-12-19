import type { EditorialSummaryVM } from '@/lib/viewmodels/editorialSummary.vm';

function statusPillClass(status: EditorialSummaryVM['hero']['status']) {
  if (status === 'NO_JOGO') return 'bg-emerald-500';
  if (status === 'FORA_DO_RITMO') return 'bg-red-500';
  return 'bg-amber-500';
}

export default function EditorialSummary({ vm }: { vm: EditorialSummaryVM }) {
  const updatedAt = new Date(vm.updatedAtISO);
  const updatedLabel = Number.isNaN(updatedAt.getTime())
    ? 'Atualizado recentemente'
    : updatedAt.toLocaleString('pt-BR');

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-[min(1400px,92vw)] py-20">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="font-serif text-5xl tracking-tighter md:text-6xl">{vm.headline.title}</h2>
            <p className="mt-4 text-sm tracking-wide text-black/55 md:text-base">{vm.headline.subtitle}</p>

            <div className="mt-8 flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.26em] text-black/40">Status</span>
              <span
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white ${statusPillClass(
                  vm.hero.status
                )}`}
              >
                {vm.hero.statusLabel}
              </span>
            </div>
          </div>

          <div className="w-full max-w-xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {vm.highlights.map((h) => (
                <div key={h.label} className="rounded-sm border border-black/10 bg-white p-5 shadow-sm">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-black/40">{h.label}</div>
                  <div className="mt-3 font-serif text-xl text-black md:text-2xl">{h.value}</div>
                  {h.note ? (
                    <div className="mt-2 text-[11px] tracking-wide text-black/50">{h.note}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-black/10 pt-12">
          <div className="mb-6 flex items-end justify-between">
            <h3 className="font-serif text-3xl tracking-tight md:text-4xl">Top 3</h3>
            <div className="text-[10px] uppercase tracking-[0.28em] text-black/35">
              Atualizado em {updatedLabel}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {vm.top3.map((row) => (
              <div key={row.rank} className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.28em] text-black/40">#{row.rank}</div>
                <div className="mt-3 font-serif text-2xl text-black">{row.name}</div>
                <div className="mt-2 text-sm tracking-wide text-black/60">
                  {row.value}
                  {row.delta ? <span className="ml-2 text-black/45">{row.delta}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
