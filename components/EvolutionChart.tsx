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

export type EvolutionPoint = {
  label: string;
  value: number;
};

type EvolutionChartProps = {
  data?: EvolutionPoint[];
  heightClassName?: string; // ex: "h-64" | "h-[280px]"
};

const FALLBACK_DATA: EvolutionPoint[] = [
  { label: 'Mon', value: 24 },
  { label: 'Tue', value: 36 },
  { label: 'Wed', value: 31 },
  { label: 'Thu', value: 49 },
  { label: 'Fri', value: 52 },
  { label: 'Sat', value: 41 },
  { label: 'Sun', value: 58 },
];

export default function EvolutionChart({
  data = FALLBACK_DATA,
  heightClassName = 'h-64',
}: EvolutionChartProps) {
  /**
   * FIX DEFINITIVO (Recharts width/height -1):
   * - ResponsiveContainer precisa de um pai com ALTURA real (>0)
   * - Em layouts grid/flex, é obrigatório min-w-0 para permitir shrink/medição correta
   */
  return (
    <div className="w-full min-w-0">
      <div className={`w-full ${heightClassName}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
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
      </div>
    </div>
  );
}
