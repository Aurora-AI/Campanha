'use client';

import { useEffect, useMemo, useState } from 'react';
import BIHeader from '@/components/bi/BIHeader';
import Breadcrumbs from '@/components/nav/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import type { Snapshot, StoreMetrics } from '@/lib/analytics/types';
import { getLatestSnapshot } from '@/lib/analytics/client/getLatestSnapshot';

function pct(v: number) {
  return `${Math.round(v * 1000) / 10}%`;
}

export default function TimelinePage() {
  const [snap, setSnap] = useState<Snapshot | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    getLatestSnapshot().then((data) => {
      if (active) setSnap(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const topYesterday = useMemo(() => {
    const rows = (snap?.storeMetrics ?? []) as StoreMetrics[];
    return [...rows].sort((a, b) => b.approvedYesterday - a.approvedYesterday).slice(0, 10);
  }, [snap]);

  const isLoading = snap === undefined;
  const vm = snap?.editorialSummary;

  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-[min(1200px,92vw)] py-16">
        <BIHeader
          title="Timeline"
          subtitle="Leitura temporal em formato editorial. Versao 1: foco no dia anterior e panorama consolidado."
          updatedAtISO={snap?.updatedAtISO}
        />
        <Breadcrumbs />

        {isLoading ? (
          <Skeleton rows={8} />
        ) : !vm ? (
          <EmptyState
            title="Nenhum dado publicado"
            description="Publique um CSV em /admin para visualizar os resultados."
          />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">
                  Ontem ({vm.pulse.dayKeyYesterday})
                </div>
                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Aprov.</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">{vm.pulse.approvedYesterday}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Digit.</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">{vm.pulse.submittedYesterday}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Indice</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">{pct(vm.pulse.approvalRateYesterday)}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Panorama consolidado</div>
                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Aprov.</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">{vm.totals.approved}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Digit.</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">{vm.totals.submitted}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Indice</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">{pct(vm.totals.approvalRate)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-sm border border-black/10 bg-white shadow-sm">
              <div className="border-b border-black/10 bg-stone-50 px-6 py-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/45">
                  Top 10 lojas (Aprovacoes de ontem)
                </div>
              </div>

              <div className="px-6 py-4">
                {topYesterday.length === 0 ? (
                  <div className="text-sm text-black/60">Sem dados de ontem.</div>
                ) : (
                  <div className="grid gap-2">
                    {topYesterday.map((s, idx) => (
                      <div
                        key={s.store}
                        className="flex items-center justify-between rounded-sm border border-black/10 px-4 py-3"
                      >
                        <div>
                          <div className="text-xs text-black/45">#{idx + 1}</div>
                          <div className="text-sm font-medium">{s.store}</div>
                          <div className="mt-1 text-xs text-black/45">{s.group}</div>
                        </div>
                        <div className="text-right tabular-nums">
                          <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Aprov. ontem</div>
                          <div className="mt-1 text-xl font-semibold">{s.approvedYesterday}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
