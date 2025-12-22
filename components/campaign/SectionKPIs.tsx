'use client';

import { MOCK_DB } from '@/lib/campaign/mock';
import FadeIn from './FadeIn';

const KPIBlock = ({ label, value, delta }: { label: string; value: string; delta?: string }) => {
  return (
    <div className="group flex h-48 flex-col justify-between border-t-2 border-transparent bg-stone-50 p-8 transition-colors duration-300 hover:border-black">
      <div className="flex items-start justify-between">
        <span className="font-sans text-xs uppercase tracking-widest text-stone-500">{label}</span>
        {delta ? (
          <span
            className={`text-xs font-bold ${delta.includes('+') ? 'text-emerald-600' : 'text-amber-600'}`}
          >
            {delta}
          </span>
        ) : null}
      </div>

      <div>
        <span className="block font-serif text-5xl tracking-tighter text-stone-900 transition-transform duration-500 group-hover:translate-x-2 md:text-6xl">
          {value}
        </span>
      </div>
    </div>
  );
};

type SectionKPIsProps = {
  data: typeof MOCK_DB.kpis;
};

export default function SectionKPIs({ data }: SectionKPIsProps) {
  const kpis = data;

  return (
    <section id="kpis" className="w-full bg-white py-24">
      <div className="mx-auto w-[min(1400px,92vw)]">
         <FadeIn>
            <h2 className="mb-12 font-serif text-4xl tracking-tighter md:text-5xl">KPIs editoriais</h2>
         </FadeIn>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {kpis.map((kpi, idx) => (
                 <FadeIn key={kpi.label} delay={idx * 0.1}>
                     <KPIBlock {...kpi} />
                 </FadeIn>
             ))}
         </div>
      </div>
    </section>
  );
}
