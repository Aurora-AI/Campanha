import { DateTime } from 'luxon';
import type { ParsedCsv } from '@/lib/analytics/csv/parseCalceleveCsv';
import { normalizeProposals } from '@/lib/analytics/normalize/normalizeProposals';
import { parsePtBrDateToISODate } from '@/lib/analytics/normalize/parsePtBrDate';
import {
  resolveCanonicalMonthDateField,
  type CanonicalMonthField,
} from '@/lib/analytics/normalize/resolveCanonicalMonthDateField';
import type { ProposalFact } from '@/lib/analytics/types';
import type { MonthlyAudit } from '@/lib/server/monthlySnapshots';
import { normalizeCnpjDigits } from '@/lib/campaign/storeCatalog';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function isInYearMonth(isoDate: string, tz: string, year: number, month: number): boolean {
  const dt = DateTime.fromISO(isoDate, { zone: tz }).startOf('day');
  return dt.isValid && dt.year === year && dt.month === month;
}

function isNumericString(value: unknown): boolean {
  const v = String(value ?? '').trim();
  return !!v && /^\d+$/.test(v);
}

function firstValue(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = String(row[k] ?? '').trim();
    if (v) return v;
  }
  return '';
}

function isDataRow(row: Record<string, unknown>): boolean {
  const proposal = firstValue(row, ['numero da proposta', 'numero proposta', 'n proposta', 'n da proposta']);
  if (!isNumericString(proposal)) return false;

  const cnpj = firstValue(row, ['cnpj']);
  const digits = normalizeCnpjDigits(cnpj);
  return digits.length === 14;
}

export type MonthlyIngestionValidationOk = {
  ok: true;
  proposals: ProposalFact[];
  canonicalMonthField: CanonicalMonthField;
  spilloverFinalizedOutsideMonthCount: number;
  audit: MonthlyAudit;
};

export type MonthlyIngestionValidationErr = {
  ok: false;
  status: number;
  body: unknown;
};

export function validateMonthlyIngestion(args: {
  parsed: ParsedCsv;
  year: number;
  month: number;
  tz: string;
}): MonthlyIngestionValidationOk | MonthlyIngestionValidationErr {
  const totalParsedRows = args.parsed.rows.length;
  const dataRows: typeof args.parsed.rows = [];
  for (const r of args.parsed.rows) {
    if (isDataRow(r as Record<string, unknown>)) dataRows.push(r);
  }
  const droppedNonDataRows = totalParsedRows - dataRows.length;

  if (dataRows.length === 0) {
    return {
      ok: false,
      status: 400,
      body: {
        error: 'INVALID_REQUEST',
        message: 'EMPTY_DATASET',
        totalParsedRows,
        dataRows: 0,
        droppedNonDataRows,
      },
    };
  }

  const headers = args.parsed.meta.normalizedHeaders ?? [];
  const resolved =
    resolveCanonicalMonthDateField({ headers, rows: dataRows, tz: args.tz }) ??
    (() => {
      const fallback = ['data de entrada', 'data entrada', 'data da proposta', 'data proposta'];
      for (const k of fallback) {
        for (const h of headers) {
          if (h === k) return { key: h, strategy: 'default' as const };
        }
      }
      return null;
    })();

  if (!resolved) {
    return {
      ok: false,
      status: 400,
      body: {
        error: 'CADASTRO_DATE_FIELD_NOT_FOUND',
        message: 'Não foi possível detectar a coluna canônica de cadastro.',
        totalParsedRows,
        dataRows: dataRows.length,
        droppedNonDataRows,
      },
    };
  }

  let invalidCadastroDateRows = 0;
  let cadastroOutsideMonthRows = 0;
  for (const r of dataRows) {
    const iso = parsePtBrDateToISODate(String(r[resolved.key] ?? ''), args.tz);
    if (!iso) {
      invalidCadastroDateRows += 1;
      continue;
    }
    if (!isInYearMonth(iso, args.tz, args.year, args.month)) {
      cadastroOutsideMonthRows += 1;
    }
  }

  if (invalidCadastroDateRows) {
    return {
      ok: false,
      status: 400,
      body: {
        error: 'CADASTRO_DATE_INVALID',
        message: 'Há linhas com data de cadastro inválida/ausente.',
        canonicalMonthField: resolved,
        invalidCadastroDateRows,
        totalParsedRows,
        dataRows: dataRows.length,
        droppedNonDataRows,
      },
    };
  }

  if (cadastroOutsideMonthRows) {
    return {
      ok: false,
      status: 400,
      body: {
        error: 'CADASTRO_DATE_OUTSIDE_MONTH',
        message: 'Há linhas com data de cadastro fora do mês selecionado.',
        canonicalMonthField: resolved,
        cadastroOutsideMonthRows,
        totalParsedRows,
        dataRows: dataRows.length,
        droppedNonDataRows,
      },
    };
  }

  const proposals = normalizeProposals(dataRows, { entryDateKey: resolved.key });
  if (proposals.length === 0) {
    return {
      ok: false,
      status: 400,
      body: {
        error: 'INVALID_REQUEST',
        message: 'EMPTY_DATASET',
        totalParsedRows,
        dataRows: dataRows.length,
        droppedNonDataRows,
      },
    };
  }

  const days = new Set<string>();
  let spilloverFinalizedOutsideMonthCount = 0;
  for (const p of proposals) {
    days.add(p.entryDateISO);
    if (!isInYearMonth(p.entryDateISO, args.tz, args.year, args.month)) {
      return {
        ok: false,
        status: 400,
        body: { error: 'CADASTRO_DATE_OUTSIDE_MONTH', message: 'Há linhas com data de cadastro fora do mês selecionado.' },
      };
    }
    if (p.finalizedDateISO && !isInYearMonth(p.finalizedDateISO, args.tz, args.year, args.month)) {
      spilloverFinalizedOutsideMonthCount += 1;
    }
  }

  if (days.size > 31) {
    return { ok: false, status: 400, body: { error: 'INVALID_REQUEST', message: 'TOO_MANY_DAYS' } };
  }

  const audit: MonthlyAudit = {
    monthKey: `${args.year}-${pad2(args.month)}`,
    canonicalMonthField: resolved,
    totalParsedRows,
    dataRows: dataRows.length,
    droppedNonDataRows,
    totalRows: dataRows.length,
    invalidCadastroDateRows,
    spillover: { finalizedOutsideMonthCount: spilloverFinalizedOutsideMonthCount },
  };

  return {
    ok: true,
    proposals,
    canonicalMonthField: resolved,
    spilloverFinalizedOutsideMonthCount,
    audit,
  };
}
