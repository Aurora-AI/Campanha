'use client';

import { MOCK_DB } from '@/lib/campaign/mock';
import { motion } from 'framer-motion';
import FadeIn from '../sandbox/FadeIn';
import { buildGroupsPulseVM } from '@/lib/viewmodels/groupsPulse.vm';

type RadialThermometerProps = {
  size: number;
  radius: number;
  circumference: number;
  offset: number;
  stroke: string;
  labelText: string;
  labelColor: string;
  cx: number;
  cy: number;
  strokeWidth: number;
};

function RadialThermometer({
  size,
  radius,
  circumference,
  offset,
  stroke,
  labelText,
  labelColor,
  cx,
  cy,
  strokeWidth,
}: RadialThermometerProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="h-full w-full -rotate-90 transform">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-serif text-2xl italic text-stone-900" style={{ color: labelColor }}>
          {labelText}
        </span>
      </div>
    </div>
  );
}

type SectionGroupsProps = {
  data: typeof MOCK_DB.campaign;
};

export default function SectionGroups({ data }: SectionGroupsProps) {
  const { groupsRadial, status, statusLabel, nextAction } = data;

  const vm = buildGroupsPulseVM({
    groupsRadial,
    status,
    statusLabel,
    nextAction,
    size: 120,
  });

  return (
    <section className="w-full bg-stone-50 py-36">
      <div className="mx-auto w-[min(1400px,92vw)]">
        <FadeIn>
          <div className="mb-16 flex flex-col items-end justify-between border-b border-stone-200 pb-8 md:flex-row">
            <h2 className="font-serif text-5xl tracking-tighter md:text-6xl">Group Pulse</h2>

            <div className="mt-4 flex items-center gap-4 md:mt-0">
              <span className="text-sm uppercase tracking-widest text-stone-400">Campaign Status:</span>
              <div
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-white ${vm.statusPillClass}`}
              >
                {vm.statusLabel}
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {vm.cards.map((card) => (
            <FadeIn key={card.key} delay={card.delay}>
              <motion.div
                className="flex cursor-default flex-col items-center rounded-sm bg-white p-8 shadow-sm"
                whileHover={{
                  y: -8,
                  boxShadow:
                    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <RadialThermometer {...card.thermometer} />
                <h3 className="mt-6 font-serif text-2xl">{card.title}</h3>
                <p className="mt-2 text-xs uppercase tracking-widest text-stone-400">{card.caption}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4}>
          <motion.div
            className="mt-16 flex flex-col items-center justify-between gap-6 border border-stone-200 bg-white p-8 md:flex-row"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <span className="mb-2 block text-xs uppercase tracking-widest text-stone-400">
                Recommended Action
              </span>
              <p className="font-serif text-xl text-stone-800 md:text-2xl">
                &quot;{vm.nextAction}&quot;
              </p>
            </div>

            <button className="bg-black px-8 py-4 text-xs uppercase tracking-widest text-white transition-colors hover:bg-stone-800">
              Execute Strategy
            </button>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
