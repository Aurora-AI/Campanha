'use client';

import { MOCK_DB } from '@/lib/campaign/mock';
import { motion } from 'framer-motion';
import FadeIn from '../sandbox/FadeIn';
import { buildGroupsPulseVM } from '@/lib/viewmodels/groupsPulse.vm';
import Link from 'next/link';
import { useMemo, useState } from 'react';

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
        <span className="font-serif text-xl tracking-tight text-stone-900" style={{ color: labelColor }}>
          {labelText}
        </span>
      </div>
    </div>
  );
}

type SectionGroupsProps = {
  campaign: typeof MOCK_DB.campaign;
  groups: typeof MOCK_DB.groups;
  metaAudit: typeof MOCK_DB.metaAudit;
};

export default function SectionGroups({ campaign, groups, metaAudit }: SectionGroupsProps) {
  const { groupsRadial, status, statusLabel, nextAction } = campaign;
  const [activeChipKey, setActiveChipKey] = useState<string | null>(null);

  const weeklyByGroup = new Map(groups.items.map((g) => [g.groupName, g]));
  const enrichedRadial = groupsRadial.map((g) => {
    const weekly = weeklyByGroup.get(g.group);
    return {
      ...g,
      achievedLabel: weekly ? String(weekly.achieved) : undefined,
      targetLabel: weekly ? String(weekly.target) : undefined,
      attainmentPct: weekly?.attainmentPct,
      statusEmoji: weekly?.status,
    };
  });

  const vm = buildGroupsPulseVM({
    groupsRadial: enrichedRadial,
    status,
    statusLabel,
    nextAction,
    weekLabel: groups.weekLabel,
    window: { startISO: groups.weekStartISO, endISO: groups.weekEndISO },
    size: 120,
  });

  const historyByGroup = useMemo(() => {
    return new Map((groups.historyWeeklyByGroup ?? []).map((g) => [g.groupId, g.weeks]));
  }, [groups.historyWeeklyByGroup]);

  const chipTooltip = (opts: {
    weekKey: string;
    rangeLabel: string;
    approved: number | null;
    effort?: number | null;
  }): string => {
    const approvedLabel = opts.approved == null ? '—' : String(opts.approved);
    const effortLabel = opts.effort == null ? '—' : String(opts.effort);
    return `${opts.weekKey} • ${opts.rangeLabel}\nAprovados: ${approvedLabel}\nPropostas: ${effortLabel}`;
  };

  return (
    <section id="campanha" className="w-full bg-white py-24 md:py-32">
      <div className="mx-auto w-[min(1400px,92vw)]">
        <FadeIn>
          <div className="mb-16 flex flex-col items-end justify-between border-b border-stone-200 pb-8 md:flex-row">
            <div>
              <h2 className="font-serif text-5xl tracking-tighter md:text-6xl">Estado da campanha</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-500">
                Termômetro editorial por grupo. O arco mostra o ritmo relativo ao objetivo semanal.
              </p>
              <div className="mt-4 text-[10px] uppercase tracking-[0.28em] text-stone-400">
                {vm.weekLabel}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 md:mt-0">
              <span className="text-sm uppercase tracking-widest text-stone-400">Status:</span>
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

                <div className="mt-6 w-full rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Realizado</div>
                      <div className="mt-1 font-serif text-3xl tracking-tight text-stone-900">
                        {card.achievedLabel ?? '0'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Objetivo</div>
                      <div className="mt-1 font-serif text-3xl tracking-tight text-stone-900">
                        {card.targetLabel ?? '0'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4 text-xs uppercase tracking-widest text-stone-500">
                    <span>Atingimento</span>
                    <span className="font-semibold text-stone-900">
                      {card.statusEmoji ? `${card.statusEmoji} ` : ''}
                      {card.attainmentLabel ?? '—'}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {(historyByGroup.get(card.title) ?? []).map((w, idx) => (
                      <span key={`${card.key}-${w.weekKey}-${idx}`} className="relative">
                        {(() => {
                          const chipKey = `${card.key}-${idx}`;
                          const tooltipText = chipTooltip({
                            weekKey: w.weekKey,
                            rangeLabel: w.rangeLabel,
                            approved: w.approved,
                            effort: w.effort,
                          });
                          const isOpen = activeChipKey === chipKey;

                          return (
                            <>
                              <button
                                type="button"
                                aria-label={`Semana encerrada W-${idx + 1}`}
                                aria-expanded={isOpen}
                                onMouseEnter={() => setActiveChipKey(chipKey)}
                                onMouseLeave={() => setActiveChipKey((prev) => (prev === chipKey ? null : prev))}
                                onFocus={() => setActiveChipKey(chipKey)}
                                onBlur={() => setActiveChipKey((prev) => (prev === chipKey ? null : prev))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') setActiveChipKey(null);
                                }}
                                onClick={() => setActiveChipKey((prev) => (prev === chipKey ? null : chipKey))}
                                className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] uppercase tracking-widest text-stone-600 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
                              >
                                W-{idx + 1}
                              </button>

                              {isOpen ? (
                                <div
                                  role="tooltip"
                                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[260px] -translate-x-1/2 whitespace-pre-line rounded-xl border border-stone-200 bg-white px-3 py-2 text-left text-[11px] leading-snug text-stone-700 shadow-sm"
                                >
                                  {tooltipText}
                                </div>
                              ) : null}
                            </>
                          );
                        })()}
                      </span>
                    ))}
                  </div>
                </div>
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
                Próxima ação
              </span>
              <p className="font-serif text-xl text-stone-800 md:text-2xl">
                &quot;{vm.nextAction}&quot;
              </p>
            </div>

            <Link
              href="/groups"
              className="border border-stone-300 px-5 py-2 text-[11px] uppercase tracking-widest text-stone-700 transition-colors hover:border-stone-500 hover:text-stone-900"
            >
              Ver grupos
            </Link>
          </motion.div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <details className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
            <summary className="cursor-pointer text-xs uppercase tracking-widest text-stone-500">
              Auditoria — metas em vigor
            </summary>
            <div className="mt-4 space-y-4 text-sm text-stone-600">
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-stone-400">Semana corrente</div>
                  <div className="mt-1 text-sm font-semibold text-stone-900">
                    {new Date(metaAudit.weekStartISO).toLocaleDateString('pt-BR')} até {new Date(metaAudit.weekEndISO).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-stone-400">Fonte</div>
                  <div className="mt-1 text-sm font-semibold text-stone-900">Configuração canônica da campanha</div>
                </div>
              </div>

              <div className="space-y-2">
                {metaAudit.targets.byGroup.map((g) => (
                  <div
                    key={g.groupId}
                    className="flex flex-col gap-1 rounded-xl border border-stone-200 bg-stone-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="font-serif text-lg text-stone-900">{g.groupId}</div>
                    <div className="text-xs uppercase tracking-widest text-stone-500">
                      Objetivo: <span className="font-semibold text-stone-900">{g.target} aprovações/semana</span>
                    </div>
                  </div>
                ))}
              </div>

              <details className="rounded-xl border border-stone-200 bg-white p-4">
                <summary className="cursor-pointer text-xs uppercase tracking-widest text-stone-500">
                  Detalhamento por loja
                </summary>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {metaAudit.targets.byStore.map((s) => (
                    <div
                      key={s.storeId}
                      className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-stone-900">{s.storeName}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[10px] uppercase tracking-[0.28em] text-stone-400">Objetivo mensal</div>
                        <div className="mt-1 font-serif text-lg text-stone-900 tabular-nums">
                          {s.monthlyTarget ?? '—'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </details>
        </FadeIn>
      </div>
    </section>
  );
}
