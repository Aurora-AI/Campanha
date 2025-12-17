'use client';

import { motion } from 'framer-motion';
import { HERO_DATA } from '@/lib/sandbox/mock';
import Image from 'next/image';
import { useRef } from 'react';

export default function Hero() {
  const constraintsRef = useRef(null);

  return (
    <section ref={constraintsRef} className="relative w-full h-screen overflow-hidden bg-[#eaeaea] flex items-center justify-center">
      {/* Background Graphic / Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Image 
            src={HERO_DATA.puzzleImages[0]} 
            alt="Hero Background" 
            fill 
            className="object-cover grayscale"
            priority
        />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 text-center pointer-events-none mix-blend-difference text-white">
        <h1 className="font-serif text-[12vw] leading-[0.85] tracking-tighter">
          {HERO_DATA.headline}
        </h1>
        <p className="font-sans text-sm md:text-base mt-8 tracking-widest uppercase opacity-80 max-w-md mx-auto">
            {HERO_DATA.subheadline}
        </p>
      </div>

      {/* Puzzle Pieces (Draggable) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        
        {/* Piece 1: Central Image */}
        <motion.div
           drag
           dragConstraints={constraintsRef}
           dragElastic={0.2}
           dragSnapToOrigin
           className="absolute top-1/2 left-1/2 w-64 h-80 md:w-96 md:h-120 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-grab active:cursor-grabbing overflow-hidden shadow-2xl"
           style={{ x: '-50%', y: '-50%' }}
           whileHover={{ scale: 1.05, rotate: 2 }}
           whileTap={{ scale: 0.95 }}
        >
             <Image 
                src={HERO_DATA.puzzleImages[1]} 
                alt="Puzzle Piece 1" 
                fill 
                className="object-cover"
            />
        </motion.div>

        {/* Piece 2: Small Accent */}
        <motion.div
           drag
           dragConstraints={constraintsRef}
           dragSnapToOrigin
           className="absolute top-1/3 left-1/4 w-32 h-32 bg-stone-900 text-white flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing shadow-xl"
           whileHover={{ rotate: -5 }}
        >
            <span className="font-serif italic text-2xl">Exo.</span>
        </motion.div>

         {/* Piece 3: Bottom Right */}
         <motion.div
           drag
           dragConstraints={constraintsRef}
           dragSnapToOrigin
           className="absolute bottom-1/4 right-1/4 w-48 h-64 pointer-events-auto cursor-grab active:cursor-grabbing overflow-hidden shadow-xl hidden md:block"
        >
             <Image 
                src={HERO_DATA.puzzleImages[2]} 
                alt="Puzzle Piece 2" 
                fill 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
            />
        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-[#1c1c1c]">
        Scroll to Explore
      </div>
    </section>
  );
}
