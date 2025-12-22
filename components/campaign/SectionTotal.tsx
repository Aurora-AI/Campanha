'use client';

import { MOCK_DB } from '@/lib/campaign/mock';
import { motion } from 'framer-motion';
import FadeIn from './FadeIn';

type SectionTotalProps = {
  data: typeof MOCK_DB.accumulated;
};

export default function SectionTotal({ data }: SectionTotalProps) {
  const { monthTotal, label } = data;

  return (
    <section id="fechamento" className="flex w-full items-center justify-center bg-stone-100 py-28 md:py-32">
       <FadeIn>
           <div className="text-center">
               <span className="block font-sans text-sm uppercase tracking-[0.2em] text-stone-500 mb-6">
                   {label}
               </span>
               <div className="relative inline-block">
                   <h2 className="font-serif text-[15vw] leading-[0.85] tracking-tighter text-stone-900">
                       {monthTotal}
                   </h2>
                   <motion.div
                     initial={{ scaleX: 0 }}
                     whileInView={{ scaleX: 1 }}
                     viewport={{ once: true }}
                     transition={{ duration: 1.5, ease: "circOut" }}
                     className="absolute -bottom-4 left-0 right-0 h-2 bg-black origin-left"
                   />
               </div>
               <p className="mt-12 font-serif italic text-stone-600 text-xl">
                   &quot;Fechamento do mês: consistência agora vale mais do que pico.&quot;
               </p>
           </div>
       </FadeIn>
    </section>
  );
}
