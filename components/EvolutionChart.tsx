'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { ChartFrame } from '@/components/charts/ChartFrame';

export type EvolutionPoint = {
  day: string;
  value: number;
};

type EvolutionChartProps = {
  data?: EvolutionPoint[];
  variant?: 'home' | 'bi';
};

const FALLBACK_DATA: EvolutionPoint[] = [
  { day: 'Mon', value: 24 },
  { day: 'Tue', value: 36 },
  { day: 'Wed', value: 31 },
  { day: 'Thu', value: 49 },
  { day: 'Fri', value: 52 },
  { day: 'Sat', value: 41 },
  { day: 'Sun', value: 58 },
];

/**
 * Custom tooltip: exibe dia e valor sem "espetáculo"
 * Respeita prefers-reduced-motion
 */
function CustomTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const data = payload[0] as unknown as { payload?: unknown; value?: ValueType };
  const row = data.payload as EvolutionPoint | undefined;
  if (!row) return null;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const value = typeof data.value === 'number' ? data.value : row.value;

  return (
    <div
      className={`rounded-sm border border-black/20 bg-white px-3 py-2 text-[11px] text-black/80 shadow-sm ${
        prefersReducedMotion ? '' : 'transition-opacity duration-75'
      }`}
    >
      <div className="font-medium">{row.day}</div>
      <div className="text-black/60">Aprovados: {value}</div>
    </div>
  );
}

export default function EvolutionChart({
  data = FALLBACK_DATA,
  variant = 'bi',
}: EvolutionChartProps) {
  const denseInterval = data.length > 20 ? 4 : 'preserveStartEnd';
  /**
   * FIX DEFINITIVO (Recharts width/height -1):
   * - ResponsiveContainer precisa de um pai com ALTURA real (>0)
   * - Em layouts grid/flex, é obrigatório min-w-0 para permitir shrink/medição correta
   */
  return (
    <ChartFrame variant={variant}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            interval={denseInterval}
          />
          <YAxis tickLine={false} axisLine={false} width={28} />
          <Tooltip
            content={(props) => <CustomTooltip {...props} />}
            cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }}
            contentStyle={{ background: 'transparent', border: 'none' }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
