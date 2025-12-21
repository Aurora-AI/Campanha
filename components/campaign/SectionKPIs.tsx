'use client';

import { MOCK_DB } from '@/lib/campaign/mock';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import FadeIn from './FadeIn';

const KPIBlock = ({ label, value, delta }: { label: string, value: string, delta?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <div ref={ref} className="bg-stone-50 border-t-2 border-transparent hover:border-black transition-colors duration-300 p-8 flex flex-col justify-between h-48 group">
            <div className="flex justify-between items-start">
               <span className="font-sans text-xs uppercase tracking-widest text-stone-500">{label}</span>
               {delta && (
                   <span className={`text-xs font-bold ${delta.includes('+') ? 'text-emerald-600' : 'text-amber-600'}`}>
                       {delta}
                   </span>
               )}
            </div>

            <div>
                 <span className="font-serif text-5xl md:text-6xl tracking-tighter text-stone-900 group-hover:translate-x-2 transition-transform duration-500 block">
                     {isInView ? value : "-"}
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
    <section className="w-full py-24 bg-white">
      <div className="mx-auto w-[min(1400px,92vw)]">
         <FadeIn>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tighter mb-12">Key Indicators</h2>
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
