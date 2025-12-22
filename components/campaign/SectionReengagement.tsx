'use client';

import { MOCK_DB } from '@/lib/campaign/mock';
import { motion } from 'framer-motion';
import Link from 'next/link';

type SectionReengagementProps = {
  data: typeof MOCK_DB.reengagement;
};

export default function SectionReengagement({ data }: SectionReengagementProps) {
  const { title, subtitle } = data;

  return (
    <section
      id="acao"
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-black py-28 text-center text-white md:py-36"
    >

       <motion.div
         initial={{ opacity: 0, scale: 0.9 }}
         whileInView={{ opacity: 1, scale: 1 }}
         viewport={{ once: true, margin: "-100px" }}
         transition={{ duration: 0.8 }}
         className="relative z-10 px-4"
       >
           <h2 className="font-serif text-6xl md:text-8xl tracking-tighter mb-6">
               {title}
           </h2>
           <div className="w-24 h-1 bg-white mx-auto mb-8" />
           <p className="font-sans text-lg md:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
               {subtitle}
           </p>

           <Link
             href="/timeline"
             className="mt-12 inline-flex px-8 py-4 border border-white/30 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
           >
             Abrir timeline
           </Link>
       </motion.div>

       {/* Subtle Background Pattern */}
       <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
       />
    </section>
  );
}
