'use client';

import { MOCK_DB } from '@/lib/campaign/mock';
import { motion } from 'framer-motion';
import FadeIn from '../sandbox/FadeIn';
import { buildGroupsPulseVM } from '@/lib/viewmodels/groupsPulse.vm';
import Link from 'next/link';

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
  data: typeof MOCK_DB.campaign;
};

export default function SectionGroups({ data }: SectionGroupsProps) {
  const { groupsRadial, status, statusLabel, nextAction, groupsWeekly, metaAudit } = data;

  const weeklyByGroup = new Map(groupsWeekly.items.map((g) => [g.groupName, g]));
  const enrichedRadial = groupsRadial.map((g) => {
    const weekly = weeklyByGroup.get(g.group);
    return {
      ...g,
      achievedLabel: weekly?.achievedLabel,
      targetLabel: weekly?.targetLabel,
      attainmentLabel: weekly?.attainmentLabel,
      status: weekly?.status,
    };
  });

  const vm = buildGroupsPulseVM({
    groupsRadial: enrichedRadial,
    status,
    statusLabel,
    nextAction,
    weekLabel: groupsWeekly.weekLabel,
    window: groupsWeekly.window,
    metaAudit,
    size: 120,
  });

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
              className="bg-black px-8 py-4 text-xs uppercase tracking-widest text-white transition-colors hover:bg-stone-800"
            >
              Ver grupos
            </Link>
          </motion.div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <details className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
            <summary className="cursor-pointer text-xs uppercase tracking-widest text-stone-500">
              Auditoria de objetivos (semanal)
            </summary>
            <div className="mt-4 space-y-4 text-sm text-stone-600">
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-stone-400">Campanha</div>
                  <div className="mt-1 font-mono text-xs">{metaAudit.campaign.startISO}</div>
                  <div className="mt-1 font-mono text-xs">{metaAudit.campaign.endISO}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-stone-400">Semana corrente</div>
                  <div className="mt-1 font-mono text-xs">{metaAudit.weekWindow.startISO}</div>
                  <div className="mt-1 font-mono text-xs">{metaAudit.weekWindow.endISO}</div>
                </div>
              </div>

              <div className="space-y-2">
                {metaAudit.byGroup.map((g) => (
                  <div
                    key={g.groupId}
                    className="flex flex-col gap-1 rounded-xl border border-stone-200 bg-stone-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="font-serif text-lg text-stone-900">{g.groupName}</div>
                    <div className="text-xs uppercase tracking-widest text-stone-500">
                      Objetivo: <span className="font-semibold text-stone-900">{g.target}</span>
                    </div>
                    <div className="font-mono text-[11px] text-stone-500">{g.source}</div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </FadeIn>
      </div>
    </section>
  );
}
