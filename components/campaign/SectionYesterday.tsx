'use client';

import * as React from 'react';
import EvolutionChart, { EvolutionPoint } from '@/components/EvolutionChart';
import PodiumHighlight from '@/src/features/home/components/PodiumHighlight';
import StoreRankingList from '@/src/features/home/components/StoreRankingList';
import type { HomeViewModel } from '@/src/features/home/contracts/homeViewModel';

type SectionYesterdayProps = {
  title?: string;
  subtitle?: string;
  summary: HomeViewModel['movement']['summary'];
  timeline?: EvolutionPoint[];
  podium: HomeViewModel['podium'];
  storeList: HomeViewModel['storeList'];
};

export default function SectionYesterday({
  title = 'Resultado do dia',
  subtitle = 'Evolucao diaria e leitura de contexto.',
  summary,
  timeline,
  podium,
  storeList,
}: SectionYesterdayProps) {
  /**
   * FIX DEFINITIVO (Recharts width/height -1):
   * - o grid pai precisa permitir shrink: min-w-0
   * - a coluna que contém o chart precisa de min-w-0
   * - o chart em si já tem wrapper com min-w-0 + altura real
   */
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm opacity-70">{subtitle}</p>
        </div>

        <div className="mb-6">
          <PodiumHighlight items={podium} />
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Coluna texto/kpis (ajuste livre) */}
          <div className="min-w-0 lg:col-span-4">
            <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
              <div className="text-xs uppercase tracking-widest opacity-60">Resumo</div>
              <div className="mt-3">
                <div className="text-xs uppercase tracking-widest text-stone-400">{summary.label}</div>
                <div className="mt-2 text-2xl font-semibold text-stone-900">{summary.value}</div>
                {summary.deltaText ? (
                  <div className="mt-2 text-xs text-stone-500">{summary.deltaText}</div>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
              <StoreRankingList items={storeList} />
            </div>
          </div>

          {/* Coluna do gráfico */}
          <div className="min-w-0 lg:col-span-8">
            <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
              <div className="mb-4 flex items-baseline justify-between">
                <div className="text-xs uppercase tracking-widest opacity-60">Evolution</div>
                <div className="text-xs opacity-50">Last 7 days</div>
              </div>

              {/* Height real + shrink OK */}
              <EvolutionChart data={timeline} variant="bi" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
