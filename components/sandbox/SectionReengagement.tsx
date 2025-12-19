'use client';

import { MOCK_DB } from '@/lib/sandbox/mock';
import { motion } from 'framer-motion';

export default function SectionReengagement() {
  const { title, subtitle } = MOCK_DB.reengagement;

  return (
    <section className="w-full py-40 bg-black text-white text-center flex flex-col items-center justify-center overflow-hidden relative">
       
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
           
           <button className="mt-12 px-8 py-4 border border-white/30 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300">
               Initiate Recovery Protocol
           </button>
       </motion.div>

       {/* Subtle Background Pattern */}
       <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
       />
    </section>
  );
}
