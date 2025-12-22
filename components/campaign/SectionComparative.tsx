'use client';

import * as React from 'react';
import { DateTime } from 'luxon';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartFrame } from '@/components/charts/ChartFrame';
import type { SandboxData } from '@/lib/campaign/mock';

type ComparativePoint = {
  dateISO: string;
  day: string;
  currentValue: number;
  baselineValue: number;
};

function toPoints(series: Array<{ dateISO: string; currentValue: number; baselineValue: number }>): ComparativePoint[] {
  return series.map((p) => {
    const dt = DateTime.fromISO(p.dateISO);
    return { ...p, day: dt.isValid ? dt.toFormat('dd') : p.dateISO };
  });
}

function fmtPct(v: number | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  return `${Math.round(v * 1000) / 10}%`;
}

function fmtPp(v: number | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  const rounded = Math.round(v * 10) / 10;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded}pp`;
}

function CompactTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const current = payload.find((p) => p.name === 'Atual')?.value ?? 0;
  const baseline = payload.find((p) => p.name === 'Mês anterior')?.value ?? 0;
  const delta = (current ?? 0) - (baseline ?? 0);
  const sign = delta > 0 ? '+' : '';

  return (
    <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs shadow-sm">
      <div className="font-mono text-[11px] text-black/60">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-6">
        <span className="text-black/60">Atual</span>
        <span className="font-semibold tabular-nums text-black">{current}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-6">
        <span className="text-black/60">Mês anterior</span>
        <span className="font-semibold tabular-nums text-black">{baseline}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-6">
        <span className="text-black/60">Δ</span>
        <span className="font-semibold tabular-nums text-black">
          {sign}
          {delta}
        </span>
      </div>
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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} interval={denseInterval} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <Tooltip content={<CompactTooltip />} cursor={{ fill: 'transparent' }} />
              <Line type="monotone" dataKey="currentValue" name="Atual" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              {showBaseline ? (
                <Line
                  type="monotone"
                  dataKey="baselineValue"
                  name="Mês anterior"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 4"
                  stroke="rgba(0,0,0,0.45)"
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
  const showBaseline = !!coverage.previousMonthLoaded;

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
            Auditoria — meta em uso e cobertura de dados
          </summary>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-black/10 bg-white p-5">
              <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Cobertura</div>
              <div className="mt-3 space-y-1 text-xs text-black/60">
                <div>
                  Mês atual carregado:{' '}
                  <span className="font-mono text-[11px] text-black">
                    {coverage.currentMonthLoaded.year}-{String(coverage.currentMonthLoaded.month).padStart(2, '0')}
                  </span>
                </div>
                <div>
                  Mês anterior:{' '}
                  <span className="font-mono text-[11px] text-black">
                    {coverage.previousMonthLoaded
                      ? `${coverage.previousMonthLoaded.year}-${String(coverage.previousMonthLoaded.month).padStart(2, '0')}`
                      : '—'}
                  </span>
                </div>
                <div>
                  Meses disponíveis:{' '}
                  <span className="font-mono text-[11px] text-black">{coverage.availableMonths.length}</span>
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
                  Baseline: <span className="font-mono text-[11px] text-black">{data.baseline.year}-{String(data.baseline.month).padStart(2, '0')}</span>
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

