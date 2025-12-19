type GroupDetailPageProps = {
  params: { id: string };
};

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  return (
    <main className="min-h-[100svh] bg-stone-50">
      <div className="mx-auto w-[min(1400px,92vw)] py-20">
        <div className="text-[10px] uppercase tracking-[0.28em] text-black/40">Group</div>
        <h1 className="mt-2 font-serif text-5xl tracking-tighter md:text-6xl">{params.id}</h1>
        <p className="mt-4 text-sm tracking-wide text-black/55">
          Area BI: detalhamento por grupo, lojas, metas e percentuais.
        </p>

        <div className="mt-10 rounded-sm border border-black/10 bg-white p-8 shadow-sm">
          <div className="text-[10px] uppercase tracking-[0.28em] text-black/40">Em construcao</div>
          <div className="mt-4 text-black/60">
            Proximo passo: conectar dados do snapshot e habilitar drill-down completo.
          </div>
        </div>
      </div>
    </main>
  );
}
