'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { SandboxData } from '@/lib/campaign/mock';

type HeroProps = {
  data: SandboxData['hero'];
};

export default function Hero({ data }: HeroProps) {
  const constraintsRef = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const { weeklyGoals, yesterdayApproved, headline, subheadline } = data;

  useEffect(() => {
    const container = constraintsRef.current;
    const media = mediaRef.current;
    if (!container || !media) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    const pointerFine = window.matchMedia('(pointer: fine)').matches;

    const maxScrollOffset = 80;
    const maxTranslate = 7;
    const maxRotate = 1.1;
    const easing = 0.09;

    const state = {
      raf: 0 as number,
      scrollY: 0,
      targetX: 0,
      targetY: 0,
      targetR: 0,
      curX: 0,
      curY: 0,
      curR: 0,
    };

    const clamp = (n: number, min: number, max: number) => {
      if (n < min) return min;
      if (n > max) return max;
      return n;
    };
    const lerp = (from: number, to: number) => from + (to - from) * easing;

    const apply = () => {
      state.curX = lerp(state.curX, state.targetX);
      state.curY = lerp(state.curY, state.targetY);
      state.curR = lerp(state.curR, state.targetR);

      const y = state.scrollY + state.curY;
      media.style.transform = `translate3d(${state.curX.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotateZ(${state.curR.toFixed(2)}deg)`;
    };

    const schedule = () => {
      if (state.raf) return;
      state.raf = window.requestAnimationFrame(() => {
        state.raf = 0;
        apply();
      });
    };

    const onScroll = () => {
      state.scrollY = clamp(window.scrollY * 0.2, -maxScrollOffset, maxScrollOffset);
      schedule();
    };

    const onMove = (e: MouseEvent) => {
      if (!pointerFine) return;
      const rect = container.getBoundingClientRect();
      const x = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5;
      const y = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5;
      const nx = clamp(x * 2 - 1, -1, 1);
      const ny = clamp(y * 2 - 1, -1, 1);
      state.targetX = nx * maxTranslate;
      state.targetY = ny * maxTranslate;
      state.targetR = nx * maxRotate;
      schedule();
    };

    const onLeave = () => {
      state.targetX = 0;
      state.targetY = 0;
      state.targetR = 0;
      schedule();
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    if (pointerFine) {
      container.addEventListener('mousemove', onMove, { passive: true });
      container.addEventListener('mouseleave', onLeave, { passive: true });
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (pointerFine) {
        container.removeEventListener('mousemove', onMove);
        container.removeEventListener('mouseleave', onLeave);
      }
      if (state.raf) window.cancelAnimationFrame(state.raf);
    };
  }, []);

  return (
    <section
      ref={constraintsRef}
      className="relative isolate flex w-full min-h-[80svh] items-center justify-center overflow-hidden bg-white"
    >
      {/* HeroMedia - full-bleed */}
      <div
        ref={mediaRef}
        className="absolute inset-0 z-0 pointer-events-none will-change-transform transform-gpu"
        aria-hidden="true"
      >
        <Image
          src="/campaign/hero.png"
          alt="Hero background"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* HeroOverlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-transparent to-black/15 pointer-events-none" />

      {/* Main Content Layer - Editorial/static */}
      <div className="relative z-40 w-full max-w-5xl px-6 pt-24 text-center text-black pointer-events-none md:pt-32 mx-auto">
        <h1 className="font-serif text-[12vw] leading-[0.85] tracking-[-0.03em] whitespace-nowrap">
          {headline}
        </h1>
        <p className="font-sans text-[12px] md:text-[13px] mt-8 tracking-[0.22em] uppercase text-black/55 max-w-xl mx-auto truncate">
          {subheadline}
        </p>

        {/* Satellites (stacked on mobile to avoid overlap) */}
        <div className="mt-10 grid w-full max-w-xl grid-cols-1 gap-4 text-left pointer-events-auto md:hidden">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Objetivo semanal por grupo</div>
            <div className="mt-4 space-y-3 text-xs uppercase tracking-widest text-stone-700">
              {weeklyGoals.map((g) => (
                <div key={g.group} className="flex items-center justify-between gap-6 border-b border-stone-100 pb-2">
                  <span>{g.group}</span>
                  <span className={g.onTrack ? 'text-emerald-600' : 'text-stone-400'}>
                    {g.actual}/{g.target}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-stone-900 p-5 text-white shadow-sm">
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/65">{yesterdayApproved.label}</div>
            <div className="mt-3 font-serif text-4xl leading-none">{yesterdayApproved.value}</div>
          </div>
        </div>

      </div>

      {/* Satellites (Draggable) */}
      <div className="absolute inset-0 z-30 pointer-events-none hidden md:block">
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragSnapToOrigin
          className="absolute left-[14%] top-[20%] -translate-y-10 lg:-translate-y-14 w-auto bg-white border border-stone-200 p-6 pointer-events-auto cursor-grab active:cursor-grabbing shadow-xl"
          whileHover={{ rotate: -2, scale: 1.05 }}
        >
          <h3 className="font-serif text-lg mb-4 text-stone-900">Objetivo semanal por grupo</h3>
          <div className="space-y-3 font-sans text-xs uppercase tracking-widest text-stone-600">
            {weeklyGoals.map((g) => (
              <div key={g.group} className="flex justify-between gap-8 border-b border-stone-100 pb-1">
                <span>{g.group}</span>
                <span className={g.onTrack ? 'text-emerald-600' : 'text-stone-400'}>
                  {g.actual}/{g.target}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragSnapToOrigin
          className="absolute bottom-[14%] right-[14%] translate-y-10 lg:translate-y-12 w-40 h-40 rounded-full bg-stone-900 text-white flex flex-col items-center justify-center p-4 pointer-events-auto cursor-grab active:cursor-grabbing shadow-xl"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <span className="font-serif text-5xl leading-none">{yesterdayApproved.value}</span>
          <span className="text-[9px] uppercase tracking-widest mt-1 opacity-80 text-center leading-tight">
            {yesterdayApproved.label}
          </span>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 text-[10px] uppercase tracking-[0.28em] text-stone-400">
        Role para explorar
      </div>
    </section>
  );
}
