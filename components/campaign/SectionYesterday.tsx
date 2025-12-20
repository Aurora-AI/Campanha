'use client';

import * as React from 'react';
import EvolutionChart, { EvolutionPoint } from '@/components/EvolutionChart';

type SectionYesterdayProps = {
  title?: string;
  subtitle?: string;
  data?: EvolutionPoint[];
};

export default function SectionYesterday({
  title = "Yesterday's Performance",
  subtitle = 'Daily evolution and strategic insights.',
  data,
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

        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Coluna texto/kpis (ajuste livre) */}
          <div className="min-w-0 lg:col-span-4">
            <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
              <div className="text-xs uppercase tracking-widest opacity-60">Summary</div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Approved</span>
                  <span className="font-medium">142</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Delta</span>
                  <span className="font-medium">+12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Trend</span>
                  <span className="font-medium">Up</span>
                </div>
              </div>
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
              <EvolutionChart data={data} variant="bi" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
