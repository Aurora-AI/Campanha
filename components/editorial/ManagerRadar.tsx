"use client";

export type ManagerRadarItem = {
  store: string;
  pendingTotal: number;
  messageToManager: string;
};

export default function ManagerRadar({ items }: { items: ManagerRadarItem[] }) {
  return (
    <section className="bg-white rounded-4xl p-6 border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900">Radar do gerente</h2>
      <p className="mt-1 text-sm text-gray-500">Onde destravar resultado agora (pendências operacionais).</p>

      {items.length === 0 ? (
        <div className="mt-6 text-sm text-gray-500">Sem pendências relevantes no período.</div>
      ) : (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((s, idx) => (
            <div key={s.store} className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-amber-700 font-mono">#{idx + 1}</div>
                  <div className="mt-1 font-bold text-gray-900">{s.store}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-amber-700">Pendências</div>
                  <div className="text-2xl font-black text-amber-900">{s.pendingTotal}</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-amber-950">{s.messageToManager}</div>

              <div className="mt-4 text-xs font-bold tracking-widest text-amber-700 uppercase">
                CTA: Abrir portal e tratar ocorrências
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

