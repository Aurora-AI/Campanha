/**
 * OS-MYCELIUM-TRUTHLINE-003: Testes de integridade da pipeline única
 */

import { describe, it, expect } from 'vitest';
import { buildStoreResults, buildGroupResults, buildGlobalResult, buildIntegrityCheck } from './truthline';
import type { StoreResult } from '@/lib/analytics/types';

describe('Truthline Pipeline', () => {
  describe('buildGroupResults', () => {
    it('deve somar lojas corretamente por grupo', () => {
      const stores: StoreResult[] = [
        {
          store: 'LOJA 12',
          storeCode: 12,
          groupCode: 'A',
          approvedYesterday: 5,
          approvedTotal: 35,
          monthlyTarget: 89,
          monthlyRatio: 35 / 89,
        },
        {
          store: 'LOJA 15',
          storeCode: 15,
          groupCode: 'A',
          approvedYesterday: 3,
          approvedTotal: 18,
          monthlyTarget: 70,
          monthlyRatio: 18 / 70,
        },
        {
          store: 'LOJA 21',
          storeCode: 21,
          groupCode: 'B',
          approvedYesterday: 6,
          approvedTotal: 23,
          monthlyTarget: 51,
          monthlyRatio: 23 / 51,
        },
      ];

      const groups = buildGroupResults(stores);

      const groupA = groups.find((g) => g.groupCode === 'A')!;
      expect(groupA.approvedYesterday).toBe(8);
      expect(groupA.approvedTotal).toBe(53);
      expect(groupA.monthlyTarget).toBe(159);
      expect(groupA.monthlyRatio).toBeCloseTo(53 / 159, 5);

      const groupB = groups.find((g) => g.groupCode === 'B')!;
      expect(groupB.approvedYesterday).toBe(6);
      expect(groupB.approvedTotal).toBe(23);
      expect(groupB.monthlyTarget).toBe(51);
      expect(groupB.monthlyRatio).toBeCloseTo(23 / 51, 5);

      const groupC = groups.find((g) => g.groupCode === 'C')!;
      expect(groupC.approvedYesterday).toBe(0);
      expect(groupC.approvedTotal).toBe(0);
      expect(groupC.monthlyTarget).toBe(0);
    });
  });

  describe('buildGlobalResult', () => {
    it('deve somar todas as lojas corretamente', () => {
      const stores: StoreResult[] = [
        {
          store: 'LOJA 12',
          storeCode: 12,
          groupCode: 'A',
          approvedYesterday: 5,
          approvedTotal: 35,
          monthlyTarget: 89,
          monthlyRatio: 35 / 89,
        },
        {
          store: 'LOJA 21',
          storeCode: 21,
          groupCode: 'B',
          approvedYesterday: 6,
          approvedTotal: 23,
          monthlyTarget: 51,
          monthlyRatio: 23 / 51,
        },
        {
          store: 'LOJA 01',
          storeCode: 1,
          groupCode: 'C',
          approvedYesterday: 1,
          approvedTotal: 12,
          monthlyTarget: 20,
          monthlyRatio: 12 / 20,
        },
      ];

      const global = buildGlobalResult(stores);

      expect(global.approvedYesterday).toBe(12);
      expect(global.approvedTotal).toBe(70);
      expect(global.monthlyTarget).toBe(160);
      expect(global.monthlyRatio).toBeCloseTo(70 / 160, 5);
    });

    it('deve ignorar lojas com monthlyTarget null', () => {
      const stores: StoreResult[] = [
        {
          store: 'LOJA 12',
          storeCode: 12,
          groupCode: 'A',
          approvedYesterday: 5,
          approvedTotal: 35,
          monthlyTarget: 89,
          monthlyRatio: 35 / 89,
        },
        {
          store: 'LOJA TESTE',
          storeCode: 99,
          groupCode: '?',
          approvedYesterday: 10,
          approvedTotal: 100,
          monthlyTarget: null,
          monthlyRatio: null,
        },
      ];

      const global = buildGlobalResult(stores);

      expect(global.approvedYesterday).toBe(15);
      expect(global.approvedTotal).toBe(135);
      expect(global.monthlyTarget).toBe(89); // Não soma null
    });
  });

  describe('buildIntegrityCheck', () => {
    it('deve retornar ok=true quando somas são consistentes', () => {
      const stores: StoreResult[] = [
        {
          store: 'LOJA 12',
          storeCode: 12,
          groupCode: 'A',
          approvedYesterday: 5,
          approvedTotal: 35,
          monthlyTarget: 89,
          monthlyRatio: 35 / 89,
        },
        {
          store: 'LOJA 21',
          storeCode: 21,
          groupCode: 'B',
          approvedYesterday: 6,
          approvedTotal: 23,
          monthlyTarget: 51,
          monthlyRatio: 23 / 51,
        },
      ];

      const groups = buildGroupResults(stores);
      const global = buildGlobalResult(stores);
      const integrity = buildIntegrityCheck(stores, groups, global);

      expect(integrity.ok).toBe(true);
      expect(integrity.diffs.stores_vs_groups.approvedYesterday).toBe(0);
      expect(integrity.diffs.stores_vs_groups.approvedTotal).toBe(0);
      expect(integrity.diffs.stores_vs_global.approvedYesterday).toBe(0);
      expect(integrity.diffs.stores_vs_global.approvedTotal).toBe(0);
    });

    it('deve retornar ok=false quando dados foram adulterados', () => {
      const stores: StoreResult[] = [
        {
          store: 'LOJA 12',
          storeCode: 12,
          groupCode: 'A',
          approvedYesterday: 5,
          approvedTotal: 35,
          monthlyTarget: 89,
          monthlyRatio: 35 / 89,
        },
      ];

      const groups = buildGroupResults(stores);
      const global = buildGlobalResult(stores);

      // Adulterar global
      global.approvedYesterday = 999;

      const integrity = buildIntegrityCheck(stores, groups, global);

      expect(integrity.ok).toBe(false);
      expect(integrity.diffs.stores_vs_global.approvedYesterday).not.toBe(0);
    });
  });

  describe('buildStoreResults', () => {
    it('deve retornar array vazio para snapshot null', () => {
      const results = buildStoreResults(null);
      expect(results).toEqual([]);
    });

    it('deve extrair código da loja e mapear grupo corretamente', () => {
      const snapshot = {
        schemaVersion: 'campaign-snapshot/v1' as const,
        campaign: { campaignId: 'test', campaignName: 'Test', timezone: 'America/Sao_Paulo' },
        updatedAtISO: '2025-12-23T00:00:00Z',
        proposals: [],
        storeMetrics: [
          {
            store: 'LOJA 12 — ARAUCÁRIA CENTRO',
            group: 'A',
            approvedTotal: 35,
            rejectedTotal: 10,
            submittedTotal: 45,
            approvalRateTotal: 0.77,
            approvedYesterday: 5,
            submittedYesterday: 7,
            approvalRateYesterday: 0.71,
          },
        ],
        editorialSummary: {} as Record<string, unknown>,
      } as Snapshot;

      const results = buildStoreResults(snapshot);

      expect(results).toHaveLength(1);
      expect(results[0].storeCode).toBe(12);
      expect(results[0].groupCode).toBe('A');
      expect(results[0].monthlyTarget).toBe(89);
      expect(results[0].monthlyRatio).toBeCloseTo(35 / 89, 5);
    });

    it('deve retornar groupCode="?" para lojas não mapeadas', () => {
      const snapshot = {
        schemaVersion: 'campaign-snapshot/v1' as const,
        campaign: { campaignId: 'test', campaignName: 'Test', timezone: 'America/Sao_Paulo' },
        updatedAtISO: '2025-12-23T00:00:00Z',
        proposals: [],
        storeMetrics: [
          {
            store: 'LOJA TESTE',
            group: 'X',
            approvedTotal: 10,
            rejectedTotal: 2,
            submittedTotal: 12,
            approvalRateTotal: 0.83,
            approvedYesterday: 1,
            submittedYesterday: 2,
            approvalRateYesterday: 0.5,
          },
        ],
        editorialSummary: {} as Record<string, unknown>,
      } as Snapshot;

      const results = buildStoreResults(snapshot);

      expect(results).toHaveLength(1);
      expect(results[0].storeCode).toBe(-1);
      expect(results[0].groupCode).toBe('?');
      expect(results[0].monthlyTarget).toBeNull();
      expect(results[0].monthlyRatio).toBeNull();
    });
  });
});
