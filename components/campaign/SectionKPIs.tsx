'use client';

import { useInView } from 'framer-motion';
import { useRef } from 'react';
import FadeIn from './FadeIn';
import type { HomeViewModel } from '@/src/features/home/contracts/homeViewModel';

const KPIBlock = ({
  label,
  value,
  deltaText,
  tone,
}: {
  label: string;
  value: string;
  deltaText?: string;
  tone?: 'positive' | 'negative' | 'neutral';
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const toneClass =
      tone === 'positive' ? 'text-emerald-600' : tone === 'negative' ? 'text-amber-600' : 'text-stone-500';

    return (
        <div ref={ref} className="bg-stone-50 border-t-2 border-transparent hover:border-black transition-colors duration-300 p-8 flex flex-col justify-between h-48 group">
            <div className="flex justify-between items-start">
               <span className="font-sans text-xs uppercase tracking-widest text-stone-500">{label}</span>
               {deltaText && (
                   <span className={`text-xs font-bold ${toneClass}`}>
                       {deltaText}
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
  items: HomeViewModel['highlights'];
};

export default function SectionKPIs({ items }: SectionKPIsProps) {
  return (
    <section className="w-full py-24 bg-white">
      <div className="mx-auto w-[min(1400px,92vw)]">
         <FadeIn>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tighter mb-12">Destaques</h2>
         </FadeIn>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {items.map((item, idx) => (
                 <FadeIn key={item.label} delay={idx * 0.1}>
                     <KPIBlock {...item} />
                 </FadeIn>
             ))}
         </div>
      </div>
    </section>
  );
}
