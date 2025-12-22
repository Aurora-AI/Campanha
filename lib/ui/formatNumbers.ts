export function fmtPct(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  return `${Math.round(v * 1000) / 10}%`;
}

export function fmtPp(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  const rounded = Math.round(v * 10) / 10;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded}pp`;
}

