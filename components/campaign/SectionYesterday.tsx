'use client';

import EvolutionChart, { EvolutionPoint } from '@/components/EvolutionChart';
import type { SandboxData } from '@/lib/campaign/mock';
import PodiumHighlight from '@/components/campaign/PodiumHighlight';
import StoreList from '@/components/campaign/StoreList';

type SectionYesterdayProps = {
  data: SandboxData['movement'];
};

export default function SectionYesterday({ data }: SectionYesterdayProps) {
  const { title, subtitle, dayLabel, yesterdayResult, podium, storeList, timeline } = data;
  /**
   * FIX DEFINITIVO (Recharts width/height -1):
   * - o grid pai precisa permitir shrink: min-w-0
   * - a coluna que contém o chart precisa de min-w-0
   * - o chart em si já tem wrapper com min-w-0 + altura real
   */
  return (
    <section id="dia" className="w-full bg-stone-50 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-serif text-4xl tracking-tight md:text-5xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60">{subtitle}</p>
          </div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-black/40">Referência: {dayLabel}</div>
        </div>

        <div className="mt-10">
          <PodiumHighlight items={podium} />
        </div>

        <div className="mt-8 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Resumo</div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div className="text-sm text-black/55">{yesterdayResult.label}</div>
                <div className="font-serif text-5xl tracking-tight text-black">{yesterdayResult.value}</div>
              </div>
              {yesterdayResult.deltaText ? (
                <div className="mt-3 text-xs tracking-wide text-black/55">{yesterdayResult.deltaText}</div>
              ) : null}
            </div>

            <StoreList items={storeList} />
          </div>

          <div className="min-w-0 lg:col-span-8">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-baseline justify-between">
                <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Evolução</div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-black/35">Últimos 7 dias</div>
              </div>

              <EvolutionChart data={timeline as EvolutionPoint[] | undefined} variant="bi" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
