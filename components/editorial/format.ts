"use client";

export type Delta = { abs: number; pct: number | null } | undefined;

export function formatSignedInt(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value > 0 ? `+${value}` : String(value);
}

export function formatPct(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDelta(delta: Delta): { abs: string; pct: string } {
  if (!delta) return { abs: "—", pct: "—" };
  return { abs: formatSignedInt(delta.abs), pct: formatPct(delta.pct) };
}

export function formatIsoToPtBr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

