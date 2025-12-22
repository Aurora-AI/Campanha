'use client';

import { MOCK_DB } from '@/lib/campaign/mock';
import { motion } from 'framer-motion';
import FadeIn from './FadeIn';

type SectionTotalProps = {
  data: typeof MOCK_DB.accumulated;
};

export default function SectionTotal({ data }: SectionTotalProps) {
  const { monthTotal, label, windowLabel, stores } = data;

  return (
    <section id="fechamento" className="w-full bg-stone-100 py-28 md:py-32">
      <div className="mx-auto w-[min(1400px,92vw)]">
        <FadeIn>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-center">
            <div className="md:col-span-5">
              <span className="mb-6 block font-sans text-sm uppercase tracking-[0.2em] text-stone-500">
                {label}
              </span>

              <div className="relative inline-block">
                <h2 className="font-serif text-[15vw] leading-[0.85] tracking-tighter text-stone-900 md:text-7xl">
                  {monthTotal}
                </h2>
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'circOut' }}
                  className="absolute -bottom-4 left-0 right-0 h-2 origin-left bg-black"
                />
              </div>

              <div className="mt-6 text-[10px] uppercase tracking-[0.28em] text-stone-500">
                Período: {windowLabel}
              </div>

              <p className="mt-10 font-serif text-xl italic text-stone-600">
                &quot;Consistência agora vale mais do que pico.&quot;
              </p>
            </div>

            <div className="md:col-span-7">
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-baseline justify-between gap-6">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">
                    Acumulado por loja
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-black/35">
                    Ordem alfabética
                  </div>
                </div>

                {stores.length === 0 ? (
                  <div className="mt-4 text-sm text-black/55">Sem dados suficientes para listar lojas.</div>
                ) : (
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {stores.map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between gap-4 rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3"
                      >
                        <div className="truncate text-sm text-black/70">{s.label}</div>
                        <div className="shrink-0 font-serif text-lg text-black">{s.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
