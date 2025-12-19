'use client';

import { motion } from 'framer-motion';
import { MOCK_DB } from '@/lib/campaign/mock';
import Image from 'next/image';
import { useRef } from 'react';

export default function Hero() {
  const constraintsRef = useRef(null);
  const { weeklyGoals, yesterdayApproved } = MOCK_DB.hero;

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }
  };

  return (
    <section ref={constraintsRef} className="relative w-full h-screen overflow-hidden bg-white flex items-center justify-center">

      {/* Background - Subtle Noise/Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply">
        <Image
             src={MOCK_DB.hero.puzzleImages?.[0] || '/campaign/hero.png'} // Fallback or correct bg asset
             alt="Texture"
             fill
             className="object-cover grayscale"
        />
      </div>

      {/* Main Content Layer - Choreographed */}
      <motion.div
        className="relative z-10 text-center pointer-events-none mix-blend-difference text-stone-900"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 variants={itemVariants} className="font-serif text-[12vw] leading-[0.85] tracking-tighter">
          {MOCK_DB.hero.headline}
        </motion.h1>
        <motion.p variants={itemVariants} className="font-sans text-sm md:text-base mt-8 tracking-widest uppercase opacity-80 max-w-md mx-auto">
            {MOCK_DB.hero.subheadline}
        </motion.p>
      </motion.div>

      {/* Satellites (Draggable) - Delayed Entrance */}
      <div className="absolute inset-0 z-20 pointer-events-none">

        {/* Piece 1: Central Image */}
        <motion.div
           drag
           dragConstraints={constraintsRef}
           dragElastic={0.2}
           dragSnapToOrigin
           className="absolute top-1/2 left-1/2 w-80 h-96 md:w-[520px] md:h-[520px] -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-grab active:cursor-grabbing overflow-hidden shadow-2xl bg-stone-100"
           style={{ x: '-50%', y: '-50%' }}
           whileHover={{ scale: 1.05, rotate: 2 }}
           whileTap={{ scale: 0.95 }}
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
        >
             <Image
                src="/campaign/hero.png"
                alt="Campaign Hero"
                fill
                className="object-cover"
                priority
            />
        </motion.div>

        {/* Piece 2: Left Satellite (Weekly Goals) */}
        <motion.div
           drag
           dragConstraints={constraintsRef}
           dragSnapToOrigin
           className="absolute left-[6%] top-[180px] w-auto bg-white border border-stone-200 p-6 pointer-events-auto cursor-grab active:cursor-grabbing shadow-xl"
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

         {/* Piece 3: Right Satellite (Yesterday Approved) */}
         <motion.div
           drag
           dragConstraints={constraintsRef}
           dragSnapToOrigin
           className="absolute right-[8%] top-[260px] w-40 h-40 rounded-full bg-stone-900 text-white flex flex-col items-center justify-center p-4 pointer-events-auto cursor-grab active:cursor-grabbing shadow-xl"
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-stone-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        Scroll to Explore
      </motion.div>
    </section>
  );
}
