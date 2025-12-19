'use client';

import { MOCK_DB } from '@/lib/sandbox/mock';
import { motion } from 'framer-motion';
import FadeIn from './FadeIn';

const RadialThermometer = ({ score, size = 120 }: { score: number, size?: number }) => {
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    // Determine color based on score (Traffic Light logic external to SVG drawing)
    let color = '#ef4444'; // Red (Default)
    if (score >= 90) color = '#10b981'; // Green
    else if (score >= 60) color = '#f59e0b'; // Yellow

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e5e5e5"
                    strokeWidth="8"
                    fill="transparent"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference} // Initial state
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    strokeLinecap="round"
                />
            </svg>
            {/* NO Numbers on Arc as per rules */}
            <div className="absolute inset-0 flex items-center justify-center">
                 <span className="font-serif italic text-2xl text-stone-900" style={{ color }}>{score}%</span>
            </div>
        </div>
    );
};

export default function SectionGroups() {
  const { groupsRadial, status, statusLabel, nextAction } = MOCK_DB.campaign;

  // Map status string to visual traffic light color
  const statusColorMap = {
      'NO_JOGO': 'bg-emerald-500',
      'EM_DISPUTA': 'bg-amber-500',
      'FORA_DO_RITMO': 'bg-red-500'
  };

  return (
    <section className="w-full py-24 bg-stone-50">
      <div className="mx-auto w-[min(1400px,92vw)]">
         <FadeIn>
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-stone-200 pb-8">
                <h2 className="font-serif text-5xl md:text-6xl tracking-tighter">Group Pulse</h2>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <span className="text-sm uppercase tracking-widest text-stone-400">Campaign Status:</span>
                    <div className={`px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest ${statusColorMap[status]}`}>
                        {statusLabel}
                    </div>
                </div>
            </div>
         </FadeIn>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {groupsRadial.map((group, index) => (
                <FadeIn key={group.group} delay={index * 0.1}>
                    <div className="bg-white p-8 rounded-sm shadow-sm flex flex-col items-center hover:shadow-md transition-shadow duration-300">
                        <RadialThermometer score={group.score} />
                        <h3 className="mt-6 font-serif text-2xl">Group {group.group}</h3>
                        <p className="mt-2 text-xs uppercase tracking-widest text-stone-400">Efficiency Score</p>
                    </div>
                </FadeIn>
            ))}
         </div>

         {/* Next Action Block */}
         <FadeIn delay={0.4}>
             <div className="mt-16 bg-white border border-stone-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                    <span className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Recommended Action</span>
                    <p className="font-serif text-xl md:text-2xl text-stone-800">
                        &quot;{nextAction}&quot;
                    </p>
                 </div>
                 <button className="px-8 py-4 bg-black text-white text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors">
                     Execute Strategy
                 </button>
             </div>
         </FadeIn>

      </div>
    </section>
  );
}
