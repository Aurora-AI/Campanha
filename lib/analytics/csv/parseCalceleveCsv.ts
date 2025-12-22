import Papa from 'papaparse';
import { detectDelimiter } from '@/lib/csv';
import type { CsvDelimiter } from '@/lib/csv';
import { detectHeaderAndRows } from '@/lib/metrics/normalize';
import type { CsvRow, Result } from '@/lib/data';

export type ParsedCsv = {
  rows: CsvRow[];
  meta: {
    delimiter: CsvDelimiter;
    headers: string[];
    normalizedHeaders: string[];
    headerIndex: number;
    parsedRows: number;
  };
};

function normalizeHeaderKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00a0/g, ' ')
    .trim()
    .replace(/^"|"$/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeCell(value: unknown): string | null {
  if (value == null) return null;
  const v = String(value).trim().replace(/^"|"$/g, '');
  return v.length > 0 ? v : null;
}

async function readInputText(input: string | Blob): Promise<string> {
  if (typeof input === 'string') return input;
  return await input.text();
}

function parseRows(csvText: string, delimiter: CsvDelimiter): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      encoding: 'UTF-8',
      delimiter,
      skipEmptyLines: true,
      complete: (results) => resolve((results.data as unknown as string[][]) ?? []),
      error: (err: unknown) => reject(err),
    });
  });
}

export async function parseCalceleveCsv(input: string | Blob): Promise<Result<ParsedCsv>> {
  try {
    const csvText = await readInputText(input);
    if (!csvText.trim()) return { ok: false, error: 'EMPTY_CSV' };

    const delimiter = detectDelimiter(csvText);
    const rawRows = await parseRows(csvText, delimiter);
    const { header, rows, headerIndex } = detectHeaderAndRows(rawRows);

    const normalizedHeaders = header.map((h) => normalizeHeaderKey(h));
    const out: CsvRow[] = [];

    for (const row of rows) {
      if (!Array.isArray(row) || row.length === 0) continue;

      const obj: CsvRow = {};
      for (let i = 0; i < normalizedHeaders.length; i += 1) {
        const key = normalizedHeaders[i];
        if (!key) continue;
        obj[key] = normalizeCell(row[i]);
      }

      if (Object.keys(obj).length > 0) out.push(obj);
    }

    return {
      ok: true,
      value: {
        rows: out,
        meta: {
          delimiter,
          headers: header,
          normalizedHeaders,
          headerIndex,
          parsedRows: out.length,
        },
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CSV_PARSE_FAILED';
    return { ok: false, error: message };
  }
}
