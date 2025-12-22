import type { CsvRow } from '@/lib/data';
import { parsePtBrDateToISODate } from '@/lib/analytics/normalize/parsePtBrDate';

export type CanonicalMonthField = {
  key: string;
  strategy: 'keyword_match' | 'statistical_fallback' | 'default';
};

const POSITIVE_PATTERNS = [
  'data cadastro',
  'cadastro',
  'digit',
  'digitacao',
  'data solicitacao',
  'solicit',
  'criado',
  'criacao',
  'data de entrada',
  'data entrada',
  'entrada',
  'data da proposta',
  'data proposta',
] as const;

const NEGATIVE_PATTERNS = ['aprov', 'final', 'ativ', 'status'] as const;

function isNegativeKey(key: string): boolean {
  const k = key.toLowerCase();
  for (const neg of NEGATIVE_PATTERNS) {
    if (k.includes(neg)) return true;
  }
  return false;
}

function parseableRate(rows: CsvRow[], key: string, tz: string): { rate: number; nonEmpty: number } {
  let nonEmpty = 0;
  let ok = 0;
  for (const r of rows) {
    const raw = r[key];
    if (raw == null) continue;
    const s = String(raw).trim();
    if (!s) continue;
    nonEmpty += 1;
    if (parsePtBrDateToISODate(s, tz)) ok += 1;
  }
  if (nonEmpty === 0) return { rate: 0, nonEmpty: 0 };
  return { rate: ok / nonEmpty, nonEmpty };
}

export function resolveCanonicalMonthDateField(args: {
  headers: string[];
  rows: CsvRow[];
  tz: string;
}): CanonicalMonthField | null {
  const headers = args.headers.map((h) => String(h || '').trim()).filter(Boolean);
  if (headers.length === 0) return null;

  for (const pattern of POSITIVE_PATTERNS) {
    for (const h of headers) {
      const key = h.toLowerCase();
      if (isNegativeKey(key)) continue;
      if (key.includes(pattern)) return { key: h, strategy: 'keyword_match' };
    }
  }

  for (const h of headers) {
    const key = h.toLowerCase();
    if (isNegativeKey(key)) continue;
    const { rate, nonEmpty } = parseableRate(args.rows, h, args.tz);
    if (nonEmpty >= 5 && rate >= 0.8) return { key: h, strategy: 'statistical_fallback' };
  }

  return null;
}

