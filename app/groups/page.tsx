'use client';

import { useEffect, useMemo, useState } from 'react';
import BIHeader from '@/components/bi/BIHeader';
import Breadcrumbs from '@/components/nav/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import type { Snapshot, StoreMetrics } from '@/lib/analytics/types';
import { getLatestSnapshot } from '@/lib/analytics/client/getLatestSnapshot';

type GroupAgg = {
  group: string;
  approvedTotal: number;
  submittedTotal: number;
  approvedYesterday: number;
  approvalRateTotal: number;
  stores: StoreMetrics[];
};

function pct(v: number) {
  return `${Math.round(v * 1000) / 10}%`;
}

export default function GroupsPage() {
  const [snap, setSnap] = useState<Snapshot | null | undefined>(undefined);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getLatestSnapshot().then((data) => {
      if (active) setSnap(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const groups = useMemo(() => {
    const metrics = (snap?.storeMetrics ?? []) as StoreMetrics[];
    const map = new Map<string, StoreMetrics[]>();

    for (const m of metrics) {
      map.set(m.group, [...(map.get(m.group) ?? []), m]);
    }

    const out: GroupAgg[] = Array.from(map.entries()).map(([group, stores]) => {
      const approvedTotal = stores.reduce((a, s) => a + s.approvedTotal, 0);
      const submittedTotal = stores.reduce((a, s) => a + s.submittedTotal, 0);
      const approvedYesterday = stores.reduce((a, s) => a + s.approvedYesterday, 0);
      const approvalRateTotal = submittedTotal ? approvedTotal / submittedTotal : 0;

      return {
        group,
        approvedTotal,
        submittedTotal,
        approvedYesterday,
        approvalRateTotal,
        stores: [...stores].sort((a, b) => b.approvedTotal - a.approvedTotal),
      };
    });

    return out.sort((a, b) => b.approvedTotal - a.approvedTotal);
  }, [snap]);

  const isLoading = snap === undefined;

  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-[min(1200px,92vw)] py-16">
        <BIHeader
          title="Grupos"
          subtitle="Visao consolidada por grupo, com detalhamento por loja."
          updatedAtISO={snap?.updatedAtISO}
        />
        <Breadcrumbs />

        {isLoading ? (
          <Skeleton rows={8} />
        ) : groups.length === 0 ? (
          <EmptyState
            title="Nenhum dado publicado"
            description="Publique um CSV em /admin para visualizar os resultados."
          />
        ) : (
          <div className="grid gap-6">
            {groups.map((g) => {
              const isOpen = openGroup === g.group;
              return (
                <div key={g.group} className="rounded-sm border border-black/10 bg-white shadow-sm">
                  <button
                    onClick={() => setOpenGroup(isOpen ? null : g.group)}
                    className="w-full px-6 py-5 text-left hover:bg-stone-50/70"
                  >
                    <div className="flex items-end justify-between gap-6">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Grupo</div>
                        <div className="mt-2 text-2xl font-semibold tracking-tight">{g.group}</div>
                      </div>
                      <div className="flex gap-8 text-right">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Aprov. Total</div>
                          <div className="mt-2 text-xl font-semibold tabular-nums">{g.approvedTotal}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Digit. Total</div>
                          <div className="mt-2 text-xl font-semibold tabular-nums">{g.submittedTotal}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Indice</div>
                          <div className="mt-2 text-xl font-semibold tabular-nums">{pct(g.approvalRateTotal)}</div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-black/10 px-6 py-5">
                      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/45">
                        Lojas do grupo
                      </div>
                      <div className="grid gap-2">
                        {g.stores.map((s) => (
                          <div
                            key={s.store}
                            className="flex items-center justify-between rounded-sm border border-black/10 px-4 py-3"
                          >
                            <div>
                              <div className="text-sm font-medium">{s.store}</div>
                              <div className="mt-1 text-xs text-black/45">Aprov. ontem: {s.approvedYesterday}</div>
                            </div>
                            <div className="flex gap-6 text-right text-sm tabular-nums">
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Aprov.</div>
                                <div className="mt-1">{s.approvedTotal}</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Digit.</div>
                                <div className="mt-1">{s.submittedTotal}</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Indice</div>
                                <div className="mt-1">{pct(s.approvalRateTotal)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
