import { DateTime } from 'luxon';
import { getCampaignConfig, resolveGroup, resolveStoreName } from '@/lib/campaign/config';
import type { ProposalFact, ProposalStatus } from '@/lib/analytics/types';
import type { CsvCell, CsvRow } from '@/lib/data';

function normalizeStatus(s: string): ProposalStatus {
  const v = (s || '').trim().toUpperCase();
  if (v === 'APROVADO' || v === 'APROVADA') return 'APROVADO';
  if (v === 'REPROVADO' || v === 'REPROVADA') return 'REPROVADO';
  return 'OUTROS';
}

function parsePtBrDateToISODate(value: string, tz: string): string | null {
  const v = (value || '').trim();
  if (!v) return null;

  const datePart = v.split(' ')[0];
  const dt = DateTime.fromFormat(datePart, 'dd/MM/yyyy', { zone: tz });
  return dt.isValid ? dt.toISODate() : null;
}

function cellToString(cell: CsvCell): string {
  if (cell == null) return '';
  return String(cell).trim();
}

function firstValue(row: CsvRow, keys: string[]): string {
  for (const k of keys) {
    const v = cellToString(row[k]);
    if (v) return v;
  }
  return '';
}

export function normalizeProposals(rows: CsvRow[]): ProposalFact[] {
  const cfg = getCampaignConfig();
  const tz = cfg.timezone;

  const out: ProposalFact[] = [];

  for (const r of rows) {
    const cnpj = firstValue(r, ['cnpj']);
    const store = resolveStoreName(cnpj, cfg);
    const group = resolveGroup(store, cfg);

    const proposalIdRaw = firstValue(r, ['numero da proposta', 'numero proposta', 'n proposta', 'n da proposta']);
    const proposalId = Number(String(proposalIdRaw).replace(/\D/g, '')) || 0;

    const statusRaw = firstValue(r, ['situacao', 'status']);
    const status = normalizeStatus(statusRaw);

    const entryISO =
      parsePtBrDateToISODate(firstValue(r, ['data de entrada', 'data entrada', 'data da proposta', 'data proposta']), tz) ??
      null;
    const finISO = parsePtBrDateToISODate(firstValue(r, ['data finalizada', 'data finalizada em', 'data finalizada']), tz);

    if (!entryISO || !proposalId) continue;

    const approved: 0 | 1 = status === 'APROVADO' ? 1 : 0;
    const rejected: 0 | 1 = status === 'REPROVADO' ? 1 : 0;

    out.push({
      proposalId,
      store,
      group,
      status,
      entryDateISO: entryISO,
      finalizedDateISO: finISO ?? null,
      approved,
      rejected,
    });
  }

  return out;
}
