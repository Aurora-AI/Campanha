'use client';

import { MANIFESTO_DATA } from '@/lib/sandbox/mock';
import FadeIn from './FadeIn';

export default function SectionManifesto() {
  return (
    <section className="min-h-[50vh] py-32 px-8 flex items-center justify-center bg-stone-900 text-stone-100">
      <FadeIn className="max-w-4xl text-center">
        <p className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight">
          &quot;{MANIFESTO_DATA.text}&quot;
        </p>
        <div className="w-16 h-px bg-stone-500 mx-auto mt-12"></div>
      </FadeIn>
    </section>
  );
}
