'use client';

import * as React from 'react';
import { DateTime } from 'luxon';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ChartFrame } from '@/components/charts/ChartFrame';
import type { SandboxData } from '@/lib/campaign/mock';
import { fmtPct, fmtPp } from '@/lib/ui/formatNumbers';

type ComparativePoint = {
  dateISO: string;
  day: string;
  currentValue: number;
  baselineValue: number | null;
};

function toPoints(series: Array<{ dateISO: string; currentValue: number; baselineValue: number | null }>): ComparativePoint[] {
  return series.map((p) => {
    const dt = DateTime.fromISO(p.dateISO);
    return { ...p, day: dt.isValid ? dt.toFormat('dd MMM', { locale: 'pt-BR' }) : p.dateISO };
  });
}

/**
 * Custom tooltip para gráficos comparativos
 * Exibe dia e valores de forma clara, sem animação
 */
function ComparativeTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className={`rounded-sm border border-black/20 bg-white px-3 py-2 text-[11px] text-black/80 shadow-sm ${
        prefersReducedMotion ? '' : 'transition-opacity duration-75'
      }`}
    >
      <div className="font-medium">{data.day}</div>
      <div className="text-black/60">Atual: {data.currentValue}</div>
      {data.baselineValue != null && (
        <div className="text-black/60">Anterior: {data.baselineValue}</div>
      )}
    </div>
  );
}

function ComparativeChart({
  title,
  subtitle,
  points,
  showBaseline,
}: {
  title: string;
  subtitle?: string;
  points: ComparativePoint[];
  showBaseline: boolean;
}) {
  const denseInterval = points.length > 20 ? 4 : 'preserveStartEnd';

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-6">
        <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">{title}</div>
        {subtitle ? <div className="text-[10px] uppercase tracking-[0.28em] text-black/35">{subtitle}</div> : null}
      </div>

      <div className="mt-4">
        <ChartFrame variant="bi">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} interval={denseInterval} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <Tooltip
                content={<ComparativeTooltip />}
                cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }}
                contentStyle={{ background: 'transparent', border: 'none' }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Line
                type="monotone"
                dataKey="currentValue"
                name="Atual"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              {showBaseline ? (
                <Line
                  type="monotone"
                  dataKey="baselineValue"
                  name="Mês anterior"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 4"
                  stroke="rgba(0,0,0,0.45)"
                  isAnimationActive={false}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>
      </div>
    </div>
  );
}

export default function SectionComparative({
  data,
  coverage,
}: {
  data: SandboxData['trendComparative'];
  coverage: SandboxData['dataCoverage'];
}) {
  const showBaseline = !!coverage.baselineMonthLoaded || !!coverage.previousMonthLoaded;
  const liveMonth = coverage.liveMonth ?? { year: coverage.currentMonthLoaded.year, month: coverage.currentMonthLoaded.month, source: 'publish-csv' as const };
  const baselineMonth = coverage.baselineMonthLoaded ?? coverage.previousMonthLoaded;

  const proposalPoints = React.useMemo(() => toPoints(data.metrics.proposals), [data.metrics.proposals]);
  const approvalPoints = React.useMemo(() => toPoints(data.metrics.approvals), [data.metrics.approvals]);

  return (
    <section id="producao" className="w-full bg-white py-24 md:py-32">
      <div className="mx-auto w-[min(1400px,92vw)]">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-serif text-5xl tracking-tighter md:text-6xl">Produção pura</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-500">
              Comparativo por dia: mês atual vs mês anterior, pareado por dia da semana e semana do mês.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-stone-50 px-5 py-4 text-xs text-black/65">
            <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Resumo</div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
              <span>
                Propostas: <span className="font-semibold text-black">{data.summary?.proposals?.currentTotal ?? 0}</span>{' '}
                {showBaseline ? (
                  <span className="text-black/55">
                    (vs {data.summary?.proposals?.baselineTotal ?? 0}, {fmtPct(data.summary?.proposals?.deltaPct)})
                  </span>
                ) : null}
              </span>
              <span>
                Aprovados: <span className="font-semibold text-black">{data.summary?.approvals?.currentTotal ?? 0}</span>{' '}
                {showBaseline ? (
                  <span className="text-black/55">
                    (vs {data.summary?.approvals?.baselineTotal ?? 0}, {fmtPct(data.summary?.approvals?.deltaPct)})
                  </span>
                ) : null}
              </span>
              <span>
                Índice: <span className="font-semibold text-black">{fmtPct(data.summary?.approvalRate?.currentPct)}</span>{' '}
                {showBaseline ? (
                  <span className="text-black/55">(Δ {fmtPp(data.summary?.approvalRate?.deltaPp)})</span>
                ) : null}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <ComparativeChart
            title="Esforço — Propostas digitadas (comparativo)"
            subtitle={showBaseline ? 'Atual vs mês anterior' : 'Sem baseline carregado'}
            points={proposalPoints}
            showBaseline={showBaseline}
          />
          <ComparativeChart
            title="Resultado — Aprovados (comparativo)"
            subtitle={showBaseline ? 'Atual vs mês anterior' : 'Sem baseline carregado'}
            points={approvalPoints}
            showBaseline={showBaseline}
          />
        </div>

        <details className="mt-10 rounded-2xl border border-black/10 bg-stone-50 p-6">
          <summary className="cursor-pointer text-xs uppercase tracking-widest text-black/55">
            Auditoria editorial
          </summary>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-black/10 bg-white p-5">
              <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Período de dados</div>
              <div className="mt-3 space-y-2 text-sm text-black/70">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-black/45">Mês atual</span>
                  <div className="mt-1 font-semibold text-black">
                    {liveMonth.month === 12 ? 'Dezembro' : 'Mês'} {liveMonth.year}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-black/45">Referência (anterior)</span>
                  <div className="mt-1 font-semibold text-black">
                    {baselineMonth
                      ? `${baselineMonth.month === 11 ? 'Novembro' : 'Mês'} ${baselineMonth.year}`
                      : '—'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-black/45">Períodos disponíveis</span>
                  <div className="mt-1 font-semibold text-black">{coverage.availableMonths.length} meses</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-5">
              <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Série em uso</div>
              <div className="mt-3 space-y-1 text-xs text-black/60">
                <div>
                  Atual: <span className="font-mono text-[11px] text-black">{data.current.year}-{String(data.current.month).padStart(2, '0')}</span>
                </div>
                <div>
                  Baseline:{' '}
                  <span className="font-mono text-[11px] text-black">
                    {showBaseline ? `${data.baseline.year}-${String(data.baseline.month).padStart(2, '0')}` : '—'}
                  </span>
                </div>
                <div className="pt-2 font-mono text-[11px] text-black/55">mode: {data.mode}</div>
              </div>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
