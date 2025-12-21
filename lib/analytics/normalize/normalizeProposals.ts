import { DateTime } from 'luxon';
import { getCampaignConfig, resolveGroup, resolveStoreName } from '@/lib/campaign/config';
import type { ProposalFact, ProposalStatus } from '@/lib/analytics/types';
import type { RawRow } from '@/lib/analytics/csv/parseCalceleveCsv';

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

export function normalizeProposals(rows: RawRow[]): ProposalFact[] {
  const cfg = getCampaignConfig();
  const tz = cfg.timezone;

  const out: ProposalFact[] = [];

  for (const r of rows) {
    const cnpj = r['CNPJ'] || '';
    const store = resolveStoreName(cnpj, cfg);
    const group = resolveGroup(store, cfg);

    const proposalIdRaw = r['Numero da Proposta'] || r['Número da Proposta'] || '';
    const proposalId = Number(String(proposalIdRaw).replace(/\D/g, '')) || 0;

    const statusRaw = r['Situacao'] || r['Situação'] || '';
    const status = normalizeStatus(statusRaw);

    const entryISO = parsePtBrDateToISODate(r['Data de entrada'] || '', tz) ?? null;
    const finISO = parsePtBrDateToISODate(r['Data Finalizada'] || '', tz);

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
