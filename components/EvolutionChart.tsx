'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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

export default function EvolutionChart({
  data = FALLBACK_DATA,
  variant = 'bi',
}: EvolutionChartProps) {
  /**
   * FIX DEFINITIVO (Recharts width/height -1):
   * - ResponsiveContainer precisa de um pai com ALTURA real (>0)
   * - Em layouts grid/flex, é obrigatório min-w-0 para permitir shrink/medição correta
   */
  return (
    <ChartFrame variant={variant}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tickLine={false} axisLine={false} width={28} />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Line
            type="monotone"
            dataKey="value"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
