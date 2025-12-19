'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';

import { MOCK_DB } from '@/lib/campaign/mock';

type HeroGlassProps = {
  puzzleSrc?: string; // default: /images/puzzle.png
  title?: string;
  subtitle?: string;
  damp?: number; // smaller = stronger. recommended 44-60
};

export default function HeroGlass({
  puzzleSrc = '/images/puzzle.png',
  title = 'Campaign Performance',
  subtitle = 'DAILY EVOLUTION AND STRATEGIC INSIGHTS FOR THE MODERN ERA.',
  damp = 52,
}: HeroGlassProps) {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const constraintsRef = useRef<HTMLElement | null>(null);

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  const { weeklyGoals, yesterdayApproved } = MOCK_DB.hero;

  const lerp = useMemo(() => 0.075, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // Inverted parallax for depth (mouse right, background left).
      target.current.x = -(dx / damp);
      target.current.y = -(dy / damp);
    };

    const tick = () => {
      current.current.x = current.current.x + (target.current.x - current.current.x) * lerp;
      current.current.y = current.current.y + (target.current.y - current.current.y) * lerp;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) scale(1.10)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [damp, lerp]);

  return (
    <section ref={constraintsRef} className="relative h-[100svh] w-full overflow-hidden bg-white">
      {/* Layer 0 - Puzzle background only */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div ref={bgRef} className="absolute inset-[-6%] will-change-transform" aria-hidden="true">
          <Image
            src={puzzleSrc}
            alt="Puzzle Head"
            fill
            priority
            className="object-contain opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/0 to-white/25" />
        </div>
      </div>

      {/* Layer 10 - Front text with glow only (glass is nearly invisible) */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-center justify-center px-6">
        <div className="text-center">
          <div className="relative inline-block px-6 py-5">
            <div
              className="pointer-events-none absolute inset-[-18px] rounded-[32px] bg-white/0 blur-2xl shadow-[0_0_120px_rgba(255,255,255,0.85)]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/35"
              aria-hidden="true"
            />

            <h1 className="relative text-[44px] font-light tracking-[-0.03em] text-black md:text-[64px] lg:text-[78px]">
              {title}
            </h1>
            <p className="relative mt-3 text-[11px] tracking-[0.22em] text-black/45 md:text-[12px]">
              {subtitle}
            </p>
          </div>

          <div className="mt-16 text-[10px] tracking-[0.28em] text-black/30">
            SCROLL TO EXPLORE
          </div>
        </div>
      </div>

      {/* Layer 20 - Satellites */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragSnapToOrigin
          className="pointer-events-auto absolute left-[5.5%] top-[22%] md:left-[6%] md:top-[22%] lg:left-[7%] lg:top-[23%] z-20 scale-[0.98] origin-left hidden md:block w-auto bg-white border border-stone-200 p-6 cursor-grab active:cursor-grabbing shadow-xl"
          whileHover={{ rotate: -2, scale: 1.05 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h3 className="mb-4 font-serif text-lg text-stone-900">Weekly Goals</h3>
          <div className="space-y-3 font-sans text-xs uppercase tracking-widest text-stone-600">
            {weeklyGoals.map((g) => (
              <div key={g.group} className="flex justify-between gap-8 border-b border-stone-100 pb-1">
                <span>{g.group}</span>
                <span className={g.actual >= g.target ? 'text-emerald-600' : 'text-stone-400'}>
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
          className="pointer-events-auto absolute right-[7%] top-[30%] md:right-[8%] md:top-[30%] lg:right-[9%] lg:top-[32%] z-20 scale-[0.92] md:scale-[0.98] origin-right flex h-40 w-40 flex-col items-center justify-center rounded-full bg-stone-900 p-4 text-white cursor-grab active:cursor-grabbing shadow-xl"
          whileHover={{ scale: 1.1, rotate: 5 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <span className="font-serif text-5xl leading-none">{yesterdayApproved.value}</span>
          <span className="mt-1 text-center text-[9px] uppercase tracking-widest leading-tight opacity-80">
            {yesterdayApproved.label}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
