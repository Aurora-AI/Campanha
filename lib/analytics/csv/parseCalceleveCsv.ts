import Papa from 'papaparse';

export type RawRow = Record<string, string>;

export function parseCalceleveCsv(text: string): RawRow[] {
  const lines = text.split(/\r?\n/);
  const usable = lines.slice(4).join('\n');

  const parsed = Papa.parse<RawRow>(usable, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
    transformHeader: (h) => (h || '').trim().replace(/^"|"$/g, ''),
    transform: (v) => (typeof v === 'string' ? v.trim().replace(/^"|"$/g, '') : (v as any)),
  });

  return (parsed.data || []).filter((r) => r && Object.keys(r).length > 0);
}
