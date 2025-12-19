"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

import PuzzlePhysicsHero from "@/components/PuzzlePhysicsHero";
import type { HeroPayload } from "@/schemas/hero.schema";

type HeroProps = {
  payload: HeroPayload;
};

export default function Hero({ payload }: HeroProps) {
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { damping: 24, stiffness: 160 });
  const smy = useSpring(my, { damping: 24, stiffness: 160 });
  const moveX = useTransform(smx, [0, 1], [-18, 18]);
  const moveY = useTransform(smy, [0, 1], [-18, 18]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const leftToneClass = useMemo(
    () => ({
      good: "text-emerald-700",
      warn: "text-amber-700",
    }),
    []
  );

  return (
    <section ref={containerRef} className="relative w-full min-h-[92vh] overflow-hidden bg-background text-foreground">
      <div ref={constraintsRef} className="absolute inset-0 z-20 pointer-events-none" />

      <div className="absolute inset-0">
        <Image src={payload.images.heroSrc} alt="" fill className="object-cover opacity-15" priority />
        <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/85 to-background" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-background/80 px-4 py-2 text-[11px] font-bold tracking-[0.25em] uppercase">
            Cognitive Puzzle
          </div>
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">{payload.title}</h1>
          <p className="max-w-2xl text-sm md:text-base text-foreground/70">{payload.subtitle}</p>
        </div>

        <div className="relative mt-12 md:mt-16">
          <div className="absolute top-[110px] left-1/2 -translate-x-1/2 translate-x-[6%] z-[20] pointer-events-none">
            <motion.div style={{ x: moveX, y: moveY }}>
              <PuzzlePhysicsHero src={payload.images.puzzleSrc} alt="Cabeça de puzzle" size={520} />
            </motion.div>
          </div>

          <motion.aside
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.14}
            dragSnapToOrigin
            className="hidden md:block absolute left-[6%] top-[180px] z-[30] w-[340px] rounded-3xl border border-black/10 bg-background/90 backdrop-blur-md shadow-xl p-6 pointer-events-auto cursor-grab active:cursor-grabbing"
            aria-label="Meta semanal por grupo"
          >
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-foreground/60 pb-3 border-b border-black/10">
              {payload.leftSatellite.title}
            </div>
            <div className="mt-4 space-y-3">
              {payload.leftSatellite.items.map((it) => (
                <div key={it.group} className="flex items-center justify-between gap-4">
                  <div className="font-serif text-sm">{it.group}</div>
                  <div className="text-xs text-foreground/60">
                    <span className="mr-3">{it.target}</span>
                    <span className={leftToneClass[it.tone]}>{it.actual}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>

          <motion.aside
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.14}
            dragSnapToOrigin
            className="absolute right-[8%] top-[260px] z-[30] h-40 w-40 md:h-52 md:w-52 rounded-full bg-foreground text-background shadow-2xl flex flex-col items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing"
            aria-label="Aprovados ontem"
          >
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-background/70">
              {payload.rightSatellite.labelTop}
            </div>
            <div className="mt-2 font-serif text-5xl md:text-6xl leading-none">{payload.rightSatellite.value}</div>
            <div className="mt-2 text-[10px] font-bold tracking-[0.35em] uppercase text-background/50">
              {payload.rightSatellite.labelBottom}
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

