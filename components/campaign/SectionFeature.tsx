'use client';

import Image from 'next/image';
import { SECTION_A_DATA } from '@/lib/sandbox/mock';
import FadeIn from './FadeIn';

export default function SectionFeature() {
  return (
    <section className="min-h-screen py-24 px-8 md:px-16 flex flex-col md:flex-row items-center gap-16 bg-white">
      <FadeIn className="w-full md:w-1/2 relative h-[60vh] md:h-[80vh]">
        <Image
          src={SECTION_A_DATA.image}
          alt="Feature Image"
          fill
          className="object-cover grayscale"
        />
      </FadeIn>
      <FadeIn delay={0.2} className="w-full md:w-1/3 flex flex-col gap-6">
         <h2 className="font-serif text-4xl md:text-5xl">{SECTION_A_DATA.title}</h2>
         <p className="font-sans text-stone-600 leading-relaxed text-sm md:text-base">
            {SECTION_A_DATA.description}
         </p>
         <button className="self-start text-xs uppercase tracking-widest border-b border-stone-800 pb-1 mt-4 hover:opacity-60 transition-opacity">
            Read More
         </button>
      </FadeIn>
    </section>
  );
}
