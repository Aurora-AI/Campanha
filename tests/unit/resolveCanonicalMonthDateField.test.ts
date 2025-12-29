import { describe, it, expect } from 'vitest';
import { resolveCanonicalMonthDateField } from '@/lib/analytics/normalize/resolveCanonicalMonthDateField';
import type { CsvRow } from '@/lib/data';

describe('resolveCanonicalMonthDateField', () => {
  it('prioriza cadastro/digitação e evita aprovação/finalização', () => {
    const rows: CsvRow[] = [
      { 'data cadastro': '01/11/2025 10:00', 'data aprovacao': '02/11/2025 10:00' },
      { 'data cadastro': '03/11/2025 10:00', 'data aprovacao': '04/11/2025 10:00' },
    ];
    const resolved = resolveCanonicalMonthDateField({
      headers: ['data aprovacao', 'data cadastro'],
      rows,
      tz: 'America/Sao_Paulo',
    });
    expect(resolved?.key).toBe('data cadastro');
    expect(resolved?.strategy).toBe('keyword_match');
  });

  it('usa fallback estatístico quando não há keywords', () => {
    const rows: CsvRow[] = [
      { col_a: '01/11/2025 10:00', col_b: 'x' },
      { col_a: '02/11/2025 10:00', col_b: 'y' },
      { col_a: '03/11/2025 10:00', col_b: 'z' },
      { col_a: '04/11/2025 10:00', col_b: 'w' },
      { col_a: '05/11/2025 10:00', col_b: 'k' },
    ];
    const resolved = resolveCanonicalMonthDateField({
      headers: ['col_a', 'col_b'],
      rows,
      tz: 'America/Sao_Paulo',
    });
    expect(resolved?.key).toBe('col_a');
    expect(resolved?.strategy).toBe('statistical_fallback');
  });
});

