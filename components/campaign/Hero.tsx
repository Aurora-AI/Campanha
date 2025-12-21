'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { SandboxData } from '@/lib/campaign/mock';

type HeroProps = {
  data: SandboxData['hero'];
};

export default function Hero({ data }: HeroProps) {
  const constraintsRef = useRef(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const { weeklyGoals, yesterdayApproved, headline, subheadline } = data;

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }
  };

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    let raf = 0;
    const maxOffset = 120;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        let offset = window.scrollY * 0.2;
        if (offset > maxOffset) offset = maxOffset;
        if (offset < -maxOffset) offset = -maxOffset;
        media.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={constraintsRef} className="relative isolate w-full min-h-[80svh] overflow-hidden bg-white flex items-center justify-center">
      {/* HeroMedia - full-bleed */}
      <div ref={mediaRef} className="absolute inset-0 z-0 pointer-events-none will-change-transform">
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

      {/* Main Content Layer - Choreographed */}
      <motion.div
        className="relative z-30 text-center pointer-events-none mix-blend-difference text-stone-900 px-6 pt-24 md:pt-32"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 variants={itemVariants} className="font-serif text-[12vw] leading-[0.85] tracking-tighter">
          {headline}
        </motion.h1>
        <motion.p variants={itemVariants} className="font-sans text-sm md:text-base mt-8 tracking-widest uppercase opacity-80 max-w-md mx-auto">
            {subheadline}
        </motion.p>
      </motion.div>

      {/* Satellites (Draggable) - Delayed Entrance */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {/* Left Satellite (Weekly Goals) - Wide Spacing [10%] */}
        <motion.div
           drag
           dragConstraints={constraintsRef}
           dragSnapToOrigin
           className="absolute top-1/3 left-[10%] w-auto bg-white border border-stone-200 p-6 pointer-events-auto cursor-grab active:cursor-grabbing shadow-xl"
           whileHover={{ rotate: -2, scale: 1.05 }}
           initial={{ opacity: 0, x: -50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.5, duration: 0.8 }}
        >
            <h3 className="font-serif text-lg mb-4 text-stone-900">Weekly Goals</h3>
            <div className="space-y-3 font-sans text-xs uppercase tracking-widest text-stone-600">
                {weeklyGoals.map((g) => (
                    <div key={g.group} className="flex justify-between gap-8 border-b border-stone-100 pb-1">
                        <span>{g.group}</span>
                        <span className={g.actual >= g.target ? "text-emerald-600" : "text-stone-400"}>
                            {g.actual}/{g.target}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>

         {/* Right Satellite (Yesterday Approved) - Wide Spacing [10%] */}
         <motion.div
           drag
           dragConstraints={constraintsRef}
           dragSnapToOrigin
           className="absolute bottom-1/4 right-[10%] w-40 h-40 rounded-full bg-stone-900 text-white flex flex-col items-center justify-center p-4 pointer-events-auto cursor-grab active:cursor-grabbing shadow-xl"
           whileHover={{ scale: 1.1, rotate: 5 }}
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6, duration: 0.8 }}
        >
            <span className="font-serif text-5xl leading-none">{yesterdayApproved.value}</span>
            <span className="text-[9px] uppercase tracking-widest mt-1 opacity-80 text-center leading-tight">
                {yesterdayApproved.label}
            </span>
        </motion.div>

      </div>

       {/* Scroll Indicator */}
       <motion.div
        className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 text-xs uppercase tracking-widest text-stone-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        Scroll to Explore
      </motion.div>

    </section>
  );
}
