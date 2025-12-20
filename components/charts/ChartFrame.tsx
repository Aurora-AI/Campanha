import * as React from 'react';

type ChartFrameProps = {
  children: React.ReactNode;
  variant?: 'home' | 'bi' | 'compact';
  className?: string;
};

/**
 * Mycelium standard:
 * - Always set a real height for chart containers.
 * - min-w-0 avoids width/height=0 in flex/grid contexts.
 * - Heights scale by breakpoint to keep charts restrained.
 */
export function ChartFrame({ children, variant = 'home', className }: ChartFrameProps) {
  const base =
    variant === 'compact'
      ? 'min-w-0 w-full h-[140px] sm:h-[160px] md:h-[180px]'
      : variant === 'home'
      ? 'min-w-0 w-full h-[180px] sm:h-[200px] md:h-[220px]'
      : 'min-w-0 w-full h-[240px] sm:h-[260px] md:h-[300px] lg:h-[340px]';

  return <div className={`${base} ${className ?? ''}`}>{children}</div>;
}
