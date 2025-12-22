export type UnknownRecord = Record<string, unknown>;

export type CsvCell = string | number | null;
export type CsvRow = Record<string, CsvCell>;

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

