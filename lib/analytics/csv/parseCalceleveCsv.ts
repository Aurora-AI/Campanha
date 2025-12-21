import Papa from 'papaparse';
import type { CsvCell, CsvRow, Result } from '@/src/types/data';

export type ParsedCsv = {
  rows: CsvRow[];
  meta: {
    rows: number;
    headers: string[];
    skippedPreambleRows: number;
    delimiter: string;
  };
};

function normalizeHeader(header: string): string {
  return (header || '').trim().replace(/^"|"$/g, '');
}

function normalizeCell(value: unknown): CsvCell {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim().replace(/^"|"$/g, '');
    return trimmed.length > 0 ? trimmed : '';
  }
  return String(value);
}

function normalizeRow(row: Record<string, unknown>): CsvRow {
  const out: CsvRow = {};
  for (const [key, value] of Object.entries(row)) {
    const header = normalizeHeader(key);
    if (!header) continue;
    out[header] = normalizeCell(value);
  }
  return out;
}

export async function parseCalceleveCsv(input: string | Blob): Promise<Result<ParsedCsv>> {
  const text = typeof input === 'string' ? input : await input.text();
  const lines = text.split(/\r?\n/);
  const skippedPreambleRows = Math.min(4, lines.length);
  const usable = lines.slice(skippedPreambleRows).join('\n');
  const delimiter = ';';

  const parsed = Papa.parse<Record<string, unknown>>(usable, {
    header: true,
    delimiter,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  if (parsed.errors && parsed.errors.length > 0) {
    return { ok: false, error: 'CSV_PARSE_ERROR' };
  }

  const rows = (parsed.data || [])
    .map((row) => normalizeRow(row ?? {}))
    .filter((row) => Object.keys(row).length > 0);

  const headers =
    parsed.meta?.fields?.map((field) => normalizeHeader(field ?? '')).filter(Boolean) ??
    Object.keys(rows[0] ?? {});

  return {
    ok: true,
    value: {
      rows,
      meta: {
        rows: rows.length,
        headers,
        skippedPreambleRows,
        delimiter,
      },
    },
  };
}
