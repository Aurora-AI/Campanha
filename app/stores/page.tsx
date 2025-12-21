'use client';

import { useEffect, useState } from 'react';
import BIHeader from '@/components/bi/BIHeader';
import Breadcrumbs from '@/components/nav/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import type { StoreSortKey, StoresReportPayload } from '@/lib/campaign/storesReport';

export default function StoresPage() {
  const [payload, setPayload] = useState<StoresReportPayload | null | undefined>(undefined);
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState<StoreSortKey>('approvedTotal');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const params = new URLSearchParams({ q, sort: sortKey });
        const res = await fetch(`/api/stores?${params.toString()}`, { cache: 'no-store' });
        const data = res.ok ? ((await res.json()) as StoresReportPayload) : null;
        if (active) setPayload(data);
      } catch {
        if (active) setPayload(null);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [q, sortKey]);

  const rows = payload?.rows ?? [];
  const isLoading = payload === undefined;

  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-[min(1200px,92vw)] py-16">
        <BIHeader
          title="Lojas"
          subtitle="KPIs por loja para leitura rapida. Use a busca e a ordenacao para navegar."
          updatedAtISO={payload?.updatedAtISO}
        />
        <Breadcrumbs />

        {isLoading ? (
          <Skeleton rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Nenhum dado publicado"
            description="Publique um CSV em /admin para visualizar os resultados."
          />
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="w-full md:w-[420px]">
                <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Buscar</div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ex.: PINHEIRINHO, Grupo A..."
                  className="mt-2 w-full rounded-sm border border-black/10 px-4 py-3 text-sm"
                />
              </div>

              <div className="w-full md:w-[320px]">
                <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Ordenar por</div>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as StoreSortKey)}
                  className="mt-2 w-full rounded-sm border border-black/10 px-4 py-3 text-sm"
                >
                  <option value="approvedTotal">Aprovadas (total)</option>
                  <option value="approvedYesterday">Aprovadas (ontem)</option>
                  <option value="submittedTotal">Digitadas (total)</option>
                  <option value="approvalRateTotal">Indice aprovacao (total)</option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-sm border border-black/10 bg-white shadow-sm">
              <div className="grid grid-cols-12 gap-0 border-b border-black/10 bg-stone-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/45">
                <div className="col-span-5">Loja</div>
                <div className="col-span-2 text-right">Aprov. Total</div>
                <div className="col-span-2 text-right">Digit. Total</div>
                <div className="col-span-1 text-right">Aprov. Ontem</div>
                <div className="col-span-2 text-right">Indice</div>
              </div>

              {rows.map((r) => (
                <div key={r.store} className="grid grid-cols-12 px-4 py-4 text-sm hover:bg-stone-50/70">
                  <div className="col-span-5">
                    <div className="font-medium">{r.store}</div>
                    <div className="mt-1 text-xs text-black/45">{r.group}</div>
                  </div>
                  <div className="col-span-2 text-right tabular-nums">{r.approvedTotal}</div>
                  <div className="col-span-2 text-right tabular-nums">{r.submittedTotal}</div>
                  <div className="col-span-1 text-right tabular-nums">{r.approvedYesterday}</div>
                  <div className="col-span-2 text-right tabular-nums">{r.approvalRateTotalLabel}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
