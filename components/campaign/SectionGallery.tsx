'use client';

import Image from 'next/image';
import { SECTION_GRID_DATA } from '@/lib/sandbox/mock';

import FadeIn from './FadeIn';

export default function SectionGallery() {
  const images = SECTION_GRID_DATA.slice(0, 3); // Just take 3 for this row

  return (
    <section className="py-24 px-8 md:px-16 bg-white">
        <FadeIn>
            <h2 className="font-serif text-3xl mb-12">Selected Works</h2>
            <div className="flex flex-col md:flex-row gap-8">
                {images.map((item, idx) => (
                    <FadeIn key={item.id} delay={idx * 0.1} className="flex-1 group cursor-pointer">
                        <div className="relative w-full aspect-4/5 overflow-hidden mb-4">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                        <div className="flex justify-between items-baseline border-b border-stone-200 pb-2">
                             <h3 className="font-sans text-sm font-bold uppercase tracking-wide">{item.title}</h3>
                             <span className="text-xs text-stone-500">{item.category}</span>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </FadeIn>
    </section>
  );
}
