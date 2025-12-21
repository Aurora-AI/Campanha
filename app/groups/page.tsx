'use client';

import { useEffect, useState } from 'react';
import BIHeader from '@/components/bi/BIHeader';
import Breadcrumbs from '@/components/nav/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import type { GroupsReportPayload } from '@/lib/campaign/groupsReport';

export default function GroupsPage() {
  const [payload, setPayload] = useState<GroupsReportPayload | null | undefined>(undefined);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/groups', { cache: 'no-store' });
        const data = res.ok ? ((await res.json()) as GroupsReportPayload) : null;
        if (active) setPayload(data);
      } catch {
        if (active) setPayload(null);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const groups = payload?.groups ?? [];
  const isLoading = payload === undefined;

  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-[min(1200px,92vw)] py-16">
        <BIHeader
          title="Grupos"
          subtitle="Visao consolidada por grupo, com detalhamento por loja."
          updatedAtISO={payload?.updatedAtISO}
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
                          <div className="mt-2 text-xl font-semibold tabular-nums">{g.approvalRateTotalLabel}</div>
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
                                <div className="mt-1">{s.approvalRateTotalLabel}</div>
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
