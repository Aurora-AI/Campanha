'use client';

import { useEffect, useState } from 'react';
import BIHeader from '@/components/bi/BIHeader';
import Breadcrumbs from '@/components/nav/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import type { TimelineReportPayload } from '@/lib/campaign/timelineReport';

export default function TimelinePage() {
  const [payload, setPayload] = useState<TimelineReportPayload | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/timeline', { cache: 'no-store' });
        const data = res.ok ? ((await res.json()) as TimelineReportPayload) : null;
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

  const isLoading = payload === undefined;
  const data = payload && payload.status === 'ok' ? payload : null;
  const topYesterday = data?.topYesterday ?? [];

  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-[min(1200px,92vw)] py-16">
        <BIHeader
          title="Timeline"
          subtitle="Leitura temporal em formato editorial. Versao 1: foco no dia anterior e panorama consolidado."
          updatedAtISO={payload?.updatedAtISO}
        />
        <Breadcrumbs />

        {isLoading ? (
          <Skeleton rows={8} />
        ) : !data ? (
          <EmptyState
            title="Nenhum dado publicado"
            description="Publique um CSV em /admin para visualizar os resultados."
          />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">
                  Ontem ({data.pulse.dayKeyYesterday})
                </div>
                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Aprov.</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">{data.pulse.approvedYesterday}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Digit.</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">{data.pulse.submittedYesterday}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Indice</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">
                      {data.pulse.approvalRateYesterdayLabel}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Panorama consolidado</div>
                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Aprov.</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">{data.totals.approved}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Digit.</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">{data.totals.submitted}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Indice</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">
                      {data.totals.approvalRateLabel}
                    </div>
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
