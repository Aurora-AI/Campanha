import { DateTime } from 'luxon';
import { buildEditorialSummaryPayload } from '@/lib/campaign/editorialSummary';
import { getCampaignConfig } from '@/lib/campaign/config';
import type { Snapshot } from '@/lib/analytics/types';

describe('editorialSummary group aggregation', () => {
  it('agrupa "ontem" por grupo somando lojas canônicas', () => {
    const config = getCampaignConfig();
    const now = DateTime.fromISO('2025-12-15T12:00:00', { zone: config.timezone });
    const yesterday = now.minus({ days: 1 }).toISODate() ?? '';

    const snapshot: Snapshot = {
      schemaVersion: 'campaign-snapshot/v1',
      campaign: { campaignId: 'test', campaignName: 'Test', timezone: config.timezone },
      updatedAtISO: now.toISO() ?? '',
      proposals: [
        ...Array.from({ length: 5 }).map((_, idx) => ({
          proposalId: idx + 1,
          store: 'LOJA 01 — CURITIBA PINHEIRINHO',
          group: 'Outro Grupo',
          status: 'APROVADO',
          entryDateISO: yesterday,
          finalizedDateISO: yesterday,
          approved: 1 as const,
          rejected: 0 as const,
        })),
        ...Array.from({ length: 2 }).map((_, idx) => ({
          proposalId: 100 + idx,
          store: 'LOJA 02 — FAZENDA RIO GRANDE PIONEIROS',
          group: 'Grupo A',
          status: 'APROVADO',
          entryDateISO: yesterday,
          finalizedDateISO: yesterday,
          approved: 1 as const,
          rejected: 0 as const,
        })),
      ],
      storeMetrics: [
        {
          store: 'LOJA 01 — CURITIBA PINHEIRINHO',
          group: 'Outro Grupo',
          approvedTotal: 5,
          rejectedTotal: 0,
          submittedTotal: 5,
          approvalRateTotal: 1,
          approvedYesterday: 5,
          submittedYesterday: 5,
          approvalRateYesterday: 1,
        },
        {
          store: 'LOJA 02 — FAZENDA RIO GRANDE PIONEIROS',
          group: 'Grupo A',
          approvedTotal: 2,
          rejectedTotal: 0,
          submittedTotal: 2,
          approvalRateTotal: 1,
          approvedYesterday: 2,
          submittedYesterday: 2,
          approvalRateYesterday: 1,
        },
      ],
      editorialSummary: {
        updatedAtISO: now.toISO() ?? '',
        hero: { headline: 'h', subheadline: 's', kpiLabel: 'k', kpiValue: '0', statusLabel: 'EM DISPUTA' },
        pulse: { approvedYesterday: 0, submittedYesterday: 0, approvalRateYesterday: 0, dayKeyYesterday: '-' },
        totals: { approved: 0, submitted: 0, approvalRate: 0 },
        comparatives: [],
        highlights: {
          topStoreByApproved: { store: '-', value: 0 },
          topStoreByApprovalRate: { store: '-', value: 0 },
          topStoreBySubmitted: { store: '-', value: 0 },
        },
        top3: [],
      },
    };

    const summary = buildEditorialSummaryPayload({ snapshot, config, now });

    const groupResults = summary.heroCards?.groupResultsYesterday ?? [];
    const groupA = groupResults.find((g) => g.group === 'Grupo A');
    expect(groupA?.approvedYesterday).toBe(7);

    const storesGroupA = (summary.storeResultsYesterday ?? []).filter((r) => r.group === 'Grupo A');
    const sumGroupA = storesGroupA.reduce((acc, s) => acc + s.approvedYesterday, 0);
    expect(sumGroupA).toBe(groupA?.approvedYesterday);
  });
});
