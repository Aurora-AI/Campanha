'use client';

import { MOCK_DB } from '@/lib/sandbox/mock';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import { ChartFrame } from '@/components/charts/ChartFrame';
import FadeIn from './FadeIn';

export default function SectionYesterday() {
  const data = MOCK_DB.movement;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative w-full py-32 bg-white flex flex-col items-center justify-center">
      <div className="w-[min(1400px,92vw)] grid grid-cols-1 md:grid-cols-2 gap-16 items-center min-w-0">

        {/* Left: Big Number Block */}
        <FadeIn>
            <div className="bg-stone-50 p-12 rounded-sm border-l-4 border-black">
                <p className="font-sans text-xs uppercase tracking-widest text-stone-400 mb-4">
                    {data.yesterdayResult.label}
                </p>
                <div className="flex items-baseline gap-4">
                    <span className="font-serif text-8xl md:text-9xl tracking-tighter leading-none">
                        {data.yesterdayResult.value}
                    </span>
                    <span className="font-sans text-xl font-medium text-emerald-600">
                        {data.yesterdayResult.delta}
                 </span>
                </div>
                 <p className="font-serif italic text-stone-500 mt-6 text-lg max-w-xs">
                    &ldquo;Consistent growth is not an accident. It is the result of relentless precision.&rdquo;
                </p>
            </div>
        </FadeIn>

        {/* Right: Line Chart Draw */}
        <div ref={ref} className="w-full min-w-0 relative">
          <ChartFrame variant="home">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeline}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a8a29e', fontSize: 12, fontFamily: 'var(--font-inter)' }}
                  dy={10}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '0px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#e5e5e5' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#000', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#000' }}
                  isAnimationActive={isInView}
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </div>

      </div>
    </section>
  );
}
