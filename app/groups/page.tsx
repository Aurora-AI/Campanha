export default function GroupsPage() {
  return (
    <main className="min-h-[100svh] bg-stone-50">
      <div className="mx-auto w-[min(1400px,92vw)] py-20">
        <h1 className="font-serif text-5xl tracking-tighter md:text-6xl">Groups</h1>
        <p className="mt-4 text-sm tracking-wide text-black/55">
          Area BI: visao detalhada por grupo, lojas, filtros e drill-down.
        </p>

        <div className="mt-10 rounded-sm border border-black/10 bg-white p-8 shadow-sm">
          <div className="text-[10px] uppercase tracking-[0.28em] text-black/40">Em construcao</div>
          <div className="mt-4 text-black/60">
            Proximo passo: consumir snapshot completo de <code>/api/latest</code> e renderizar cards + filtros.
          </div>
        </div>
      </div>
    </main>
  );
}
