import { DateTime } from 'luxon';
import { getCampaignConfig, resolveGroup, resolveStoreName } from '@/lib/campaign/config';
import type { ProposalFact, ProposalStatus } from '@/lib/analytics/types';
import type { CsvCell, CsvRow } from '@/src/types/data';

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

function cellToString(value: CsvCell): string {
  if (value == null) return '';
  return String(value).trim();
}

export function normalizeProposals(rows: CsvRow[]): ProposalFact[] {
  const cfg = getCampaignConfig();
  const tz = cfg.timezone;

  const out: ProposalFact[] = [];

  for (const r of rows) {
    const cnpj = cellToString(r['CNPJ']);
    const store = resolveStoreName(cnpj, cfg);
    const group = resolveGroup(store, cfg);

    const proposalIdRaw = cellToString(r['Numero da Proposta'] ?? r['Número da Proposta']);
    const proposalId = Number(String(proposalIdRaw).replace(/\D/g, '')) || 0;

    const statusRaw = cellToString(r['Situacao'] ?? r['Situação']);
    const status = normalizeStatus(statusRaw);

    const entryISO = parsePtBrDateToISODate(cellToString(r['Data de entrada']), tz) ?? null;
    const finISO = parsePtBrDateToISODate(cellToString(r['Data Finalizada']), tz);

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
