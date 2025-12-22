'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MX_MOTION } from '@/lib/ui/motion';

export type GlassStoreRankingRow = {
  id: string;
  storeLabel: string;
  approved: number;
  effort?: number | null;
  goalPct?: number | null;
  deltaPp?: number | null;
};

type Props = {
  title: string;
  subtitle?: string;
  rows: GlassStoreRankingRow[];
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function formatPp(v: number) {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(0)} p.p.`;
}

function formatPct(v: number) {
  return `${v.toFixed(0)}%`;
}

export function GlassStoreRanking(props: Props) {
  const { title, subtitle, rows, className } = props;
  const reduceMotion = useReducedMotion();
  const enableMotion = !reduceMotion;

  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0, lift: 0 });
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!enableMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5;
    const y = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5;

    const ry = clamp(
      (x - 0.5) * (MX_MOTION.parallax.tiltDeg * 2),
      -MX_MOTION.parallax.tiltDeg,
      MX_MOTION.parallax.tiltDeg
    );
    const rx = clamp(
      (0.5 - y) * (MX_MOTION.parallax.tiltDeg * 2),
      -MX_MOTION.parallax.tiltDeg,
      MX_MOTION.parallax.tiltDeg
    );

    setTilt({ rx, ry, lift: MX_MOTION.parallax.liftPx });
  };

  const onPointerLeave = () => {
    setTilt({ rx: 0, ry: 0, lift: 0 });
    setActiveId(null);
  };

  return (
    <div className={`mx-font mx-no-motion ${className ?? ''}`}>
      <div className="mb-3">
        <div className="text-[11px] tracking-[0.22em] uppercase" style={{ color: 'var(--mx-text-3)' }}>
          {title}
        </div>
        {subtitle ? (
          <div className="mt-1 text-[13px] tracking-[0.18em] uppercase" style={{ color: 'var(--mx-text-2)' }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      <motion.div
        ref={cardRef}
        className="mx-glass-card p-4"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{ transformStyle: 'preserve-3d' }}
        animate={
          enableMotion
            ? {
                rotateX: tilt.rx,
                rotateY: tilt.ry,
                y: -tilt.lift,
              }
            : undefined
        }
        transition={enableMotion ? { duration: MX_MOTION.dur.med, ease: MX_MOTION.ease.out } : undefined}
      >
        <div className="mx-hairline mb-3 opacity-70" />

        <div className="grid gap-2">
          {rows.map((row) => {
            const isActive = activeId === row.id;
            const isGood = row.approved > 0;

            return (
              <motion.button
                key={row.id}
                type="button"
                className="mx-row w-full text-left px-3 py-3"
                onPointerEnter={() => setActiveId(row.id)}
                onFocus={() => setActiveId(row.id)}
                onBlur={() => setActiveId(null)}
                aria-expanded={isActive}
                layout={enableMotion}
                animate={
                  enableMotion
                    ? {
                        scale: isActive ? 1.01 : 1,
                        boxShadow: isActive
                          ? '0 10px 26px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.12)'
                          : '0 6px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.10)',
                      }
                    : undefined
                }
                transition={enableMotion ? { duration: MX_MOTION.dur.fast, ease: MX_MOTION.ease.out } : undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div
                      className="truncate text-[13.5px] leading-[1.2] tracking-[0.02em]"
                      style={{ color: 'var(--mx-text-1)', fontWeight: 520 }}
                    >
                      {row.storeLabel}
                    </div>

                    {isActive ? (
                      <motion.div
                        className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1"
                        style={{ color: 'var(--mx-text-2)' }}
                        layout={enableMotion}
                        initial={enableMotion ? { opacity: 0, y: -2 } : { opacity: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={enableMotion ? { opacity: 0, y: -2 } : { opacity: 0 }}
                        transition={enableMotion ? { duration: MX_MOTION.dur.med, ease: MX_MOTION.ease.out } : undefined}
                      >
                        {row.effort != null ? (
                          <span className="text-[12px]">
                            Esforço: <span style={{ color: 'var(--mx-text-1)' }}>{row.effort}</span>
                          </span>
                        ) : null}
                        {row.goalPct != null ? (
                          <span className="text-[12px]">
                            Objetivo: <span style={{ color: 'var(--mx-text-1)' }}>{formatPct(row.goalPct)}</span>
                          </span>
                        ) : null}
                        {row.deltaPp != null ? (
                          <span className="text-[12px]">
                            Δ: <span style={{ color: 'var(--mx-text-1)' }}>{formatPp(row.deltaPp)}</span>
                          </span>
                        ) : null}
                      </motion.div>
                    ) : null}
                  </div>

                  <div className="shrink-0">
                    <span className="mx-pill">
                      <span className={`mx-dot ${isGood ? 'mx-dot--good' : 'mx-dot--bad'}`} />
                      <span className="text-[12px]" style={{ color: 'var(--mx-text-1)', fontWeight: 560 }}>
                        {row.approved}
                      </span>
                      <span className="text-[12px]" style={{ color: 'var(--mx-text-2)' }}>
                        aprov.
                      </span>
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div
          className="pointer-events-none mt-4 h-10 w-full rounded-[16px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06), transparent)',
            border: '1px solid rgba(255,255,255,0.08)',
            opacity: 0.7,
          }}
        />
      </motion.div>
    </div>
  );
}
