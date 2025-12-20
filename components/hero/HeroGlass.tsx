'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';

type HeroGlassProps = {
  backgroundSrc?: string; // default: /images/hero-final.png
  title?: string;
  subtitle?: string;
  damp?: number; // smaller = stronger. recommended 44-60
  meta?: { approvedYesterday: number; targetToday: number; dayRatio: number };
  highlight?: { store: string; approvedYesterday: number };
};

const numberFormatter = new Intl.NumberFormat('pt-BR');

function formatInt(value: number, fallback = '—') {
  if (!Number.isFinite(value)) return fallback;
  return numberFormatter.format(value);
}

function formatRatio(value: number, targetToday: number) {
  if (!Number.isFinite(value) || !Number.isFinite(targetToday) || targetToday <= 0) return '—';
  return `${value.toFixed(2).replace('.', ',')}x`;
}

export default function HeroGlass({
  backgroundSrc = '/images/hero-final.png',
  title = 'Calceleve - Campanha aceleração 2025',
  subtitle = 'EVOLUÇÃO DIÁRIA E INSIGHTS ESTRATÉGICOS PARA A TOMADA DE DECISÃO.',
  damp = 52,
  meta,
  highlight,
}: HeroGlassProps) {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  const lerp = useMemo(() => 0.075, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // Inverted parallax for depth (mouse right, background left).
      target.current.x = -(dx / damp);
      target.current.y = -(dy / damp);
    };

    const tick = () => {
      current.current.x = current.current.x + (target.current.x - current.current.x) * lerp;
      current.current.y = current.current.y + (target.current.y - current.current.y) * lerp;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) scale(1.10)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [damp, lerp]);

  const approvedLabel = formatInt(meta?.approvedYesterday ?? 0);
  const targetLabel = meta?.targetToday && meta.targetToday > 0 ? formatInt(meta.targetToday) : '—';
  const ratioLabel = formatRatio(meta?.dayRatio ?? 0, meta?.targetToday ?? 0);
  const highlightStore = highlight?.store?.trim() ? highlight.store : '—';
  const highlightApprovedValue =
    typeof highlight?.approvedYesterday === 'number' ? highlight.approvedYesterday : NaN;
  const highlightApproved = Number.isFinite(highlightApprovedValue)
    ? `${formatInt(highlightApprovedValue)} aprovadas`
    : '—';

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-white">
      {/* Layer 0 - Background image only */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div ref={bgRef} className="absolute inset-[-6%] will-change-transform" aria-hidden="true">
          <Image
            src={backgroundSrc}
            alt="Hero background"
            fill
            priority
            className="object-contain opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/0 to-white/25" />
        </div>
      </div>

      {/* Layer 10 - Front text with glow only (glass is nearly invisible) */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-center justify-center px-6">
        <div className="text-center">
          <div className="relative inline-block px-6 py-5">
            <div
              className="pointer-events-none absolute inset-[-18px] rounded-[32px] bg-white/0 blur-2xl shadow-[0_0_120px_rgba(255,255,255,0.85)]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/35"
              aria-hidden="true"
            />

            <h1 className="relative text-[44px] font-light tracking-[-0.03em] text-black md:text-[64px] lg:text-[78px]">
              {title}
            </h1>
            <p className="relative mt-3 text-[11px] tracking-[0.22em] text-black/45 md:text-[12px]">
              {subtitle}
            </p>
          </div>

          <div className="mt-16 text-[10px] tracking-[0.28em] text-black/30">
            ROLE PARA EXPLORAR
          </div>

          <div className="mt-8 flex justify-center md:hidden">
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-black px-3 text-center text-white shadow-sm">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/70">DESTAQUE DO DIA</div>
              <div className="mt-1 text-[10px] font-semibold leading-tight">{highlightStore}</div>
              <div className="mt-1 text-[11px] font-semibold tabular-nums">{highlightApproved}</div>
              <div className="mt-1 text-[9px] uppercase tracking-[0.28em] text-white/80">Parabéns!</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto absolute left-[6%] top-[14%] z-20 hidden w-[260px] rounded-sm border border-black/10 bg-white/95 p-5 shadow-sm md:block">
        <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">META DO DIA</div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-black/60">Executado:</span>
            <span className="font-semibold tabular-nums text-black/80">{approvedLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-black/60">Esperado:</span>
            <span className="font-semibold tabular-nums text-black/80">{targetLabel}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-black/45">
            <span>Ritmo:</span>
            <span className="font-semibold tabular-nums text-black/70">{ratioLabel}</span>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto absolute bottom-[12%] right-[6%] z-20 hidden md:block">
        <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-black px-5 text-center text-white shadow-sm">
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/70">DESTAQUE DO DIA</div>
          <div className="mt-2 text-xs font-semibold leading-tight">{highlightStore}</div>
          <div className="mt-2 text-sm font-semibold tabular-nums">{highlightApproved}</div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/80">Parabéns!</div>
        </div>
      </div>
    </section>
  );
}
