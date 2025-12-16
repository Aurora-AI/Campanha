"use client";

import { formatIsoToPtBr } from "./format";

type CoverHeroProps = {
  title?: string;
  subtitle?: string;
  lastDay: string;
  totalApproved: number;
  yesterdayApproved: number;
};

export default function CoverHero({
  title = "Campanha Mycelium",
  subtitle = "Revista de dados — Aprovados como métrica soberana",
  lastDay,
  totalApproved,
  yesterdayApproved,
}: CoverHeroProps) {
  return (
    <section className="bg-linear-to-br from-gray-950 to-gray-900 text-white rounded-4xl p-8 md:p-12 border border-gray-800">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold tracking-widest uppercase">
            CAPA
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-medium leading-[1.05]">{title}</h1>
          <p className="text-white/70 text-sm md:text-base max-w-2xl">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
          <div className="rounded-3xl bg-white/10 border border-white/10 p-5">
            <div className="text-[11px] font-bold tracking-[0.25em] text-white/60 uppercase">Aprovados no período</div>
            <div className="mt-2 text-4xl font-black">{totalApproved}</div>
          </div>
          <div className="rounded-3xl bg-white/10 border border-white/10 p-5">
            <div className="text-[11px] font-bold tracking-[0.25em] text-white/60 uppercase">
              Aprovados em {formatIsoToPtBr(lastDay)}
            </div>
            <div className="mt-2 text-4xl font-black">{yesterdayApproved}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

