import { describe, expect, it } from 'vitest';

import { computeSnapshot } from '@/lib/analytics/compute/computeSnapshot';
import { buildEditorialSummaryPayload } from '@/lib/campaign/editorialSummary';
import { getCampaignConfig } from '@/lib/campaign/config';
import type { ProposalFact } from '@/lib/analytics/types';

describe('regression: arquivos 2026 (datas fora do config/hoje)', () => {
  it('computeSnapshot usa o último dia do dataset como referência', () => {
    const proposals: ProposalFact[] = [
      {
        proposalId: 1,
        store: 'LOJA 06 — RIO BRANCO DO SUL CENTRO',
        group: 'Grupo C',
        status: 'APROVADO',
        entryDateISO: '2026-01-31',
        finalizedDateISO: '2026-01-31',
        approved: 1,
        rejected: 0,
      },
      {
        proposalId: 2,
        store: 'LOJA 06 — RIO BRANCO DO SUL CENTRO',
        group: 'Grupo C',
        status: 'APROVADO',
        entryDateISO: '2026-01-30',
        finalizedDateISO: '2026-01-30',
        approved: 1,
        rejected: 0,
      },
    ];

    const snapshot = computeSnapshot(proposals);
    expect(snapshot.editorialSummary.pulse.dayKeyYesterday).toBe('2026-01-31');
    expect(snapshot.editorialSummary.pulse.approvedYesterday).toBe(1);
  });

  it('buildEditorialSummaryPayload não zera quando o config está preso em 2025', () => {
    const config = getCampaignConfig(); // Dez/2025, por padrão no repo
    const proposals: ProposalFact[] = [
      {
        proposalId: 1,
        store: 'LOJA 06 — RIO BRANCO DO SUL CENTRO',
        group: 'Grupo C',
        status: 'APROVADO',
        entryDateISO: '2026-01-31',
        finalizedDateISO: '2026-01-31',
        approved: 1,
        rejected: 0,
      },
    ];

    const snapshot = computeSnapshot(proposals);
    const summary = buildEditorialSummaryPayload({ snapshot, config });

    expect(summary.pulse.dayKeyYesterday).toBe('2026-01-31');
    expect(summary.pulse.approvedYesterday).toBe(1);
    expect(summary.hero.kpiValue).toBe('1');
  });
});

