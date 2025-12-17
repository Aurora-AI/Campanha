'use client';

import Image from 'next/image';
import { SECTION_GRID_DATA } from '@/lib/sandbox/mock';
import FadeIn from './FadeIn';

export default function SectionGrid() {
  return (
    <section className="min-h-screen py-24 px-8 md:px-16 bg-stone-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 auto-rows-[400px]">
        {SECTION_GRID_DATA.map((item, index) => {
            // Asymmetric spans based on index
            const colSpan = index === 0 ? 'lg:col-span-8' : 
                            index === 1 ? 'lg:col-span-4' : 
                            index === 2 ? 'lg:col-span-5' : 'lg:col-span-7';
            
            return (
                <FadeIn key={item.id} delay={index * 0.1} className={`relative group overflow-hidden ${colSpan} bg-stone-200`}>
                     <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 p-6 w-full bg-linear-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs uppercase tracking-widest mb-1">{item.category}</p>
                        <h3 className="font-serif text-2xl">{item.title}</h3>
                    </div>
                </FadeIn>
            )
        })}
      </div>
    </section>
  );
}
