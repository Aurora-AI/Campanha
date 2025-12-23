/**
 * OS-MYCELIUM-TRUTHLINE-003: Pipeline Única de Verdade
 * Tudo nasce de storeResults → grupos e global são somas → integridade matemática
 */

import type { Snapshot, StoreResult, GroupResult, GlobalResult, IntegrityCheck, GroupCode } from '@/lib/analytics/types';
import { extractStoreCode, getStoreGroup, getStoreMonthlyTarget } from '@/lib/analytics/campaignTargets';

/**
 * WP2.1: Construir resultados individuais por loja (fonte primária única)
 */
export function buildStoreResults(snapshot: Snapshot | null): StoreResult[] {
  if (!snapshot || !Array.isArray(snapshot.storeMetrics)) {
    return [];
  }

  return snapshot.storeMetrics
    .map((metrics) => {
      const storeCode = extractStoreCode(metrics.store) ?? -1;
      const groupCode: GroupCode = storeCode >= 0 ? getStoreGroup(storeCode) : '?';
      const monthlyTarget = storeCode >= 0 ? getStoreMonthlyTarget(storeCode) : null;
      const monthlyRatio = monthlyTarget ? metrics.approvedTotal / monthlyTarget : null;

      return {
        store: metrics.store,
        storeCode,
        groupCode,
        approvedYesterday: metrics.approvedYesterday ?? 0,
        approvedTotal: metrics.approvedTotal ?? 0,
        monthlyTarget,
        monthlyRatio,
      };
    })
    .sort((a, b) => b.approvedTotal - a.approvedTotal || a.store.localeCompare(b.store));
}

/**
 * WP2.2: Construir resultados por grupo (soma de lojas do grupo)
 */
export function buildGroupResults(stores: StoreResult[]): GroupResult[] {
  const groups = new Map<'A' | 'B' | 'C', GroupResult>();

  // Inicializar grupos A, B, C
  (['A', 'B', 'C'] as const).forEach((code) => {
    groups.set(code, {
      groupCode: code,
      approvedYesterday: 0,
      approvedTotal: 0,
      monthlyTarget: 0,
      monthlyRatio: 0,
    });
  });

  // Somar lojas por grupo
  for (const store of stores) {
    if (store.groupCode === '?') continue;
    
    const group = groups.get(store.groupCode)!;
    group.approvedYesterday += store.approvedYesterday;
    group.approvedTotal += store.approvedTotal;
    group.monthlyTarget += store.monthlyTarget ?? 0;
  }

  // Calcular ratios
  for (const group of groups.values()) {
    group.monthlyRatio = group.monthlyTarget > 0 ? group.approvedTotal / group.monthlyTarget : 0;
  }

  return Array.from(groups.values()).sort((a, b) => a.groupCode.localeCompare(b.groupCode));
}

/**
 * WP2.3: Construir resultado global (soma de todas as lojas)
 */
export function buildGlobalResult(stores: StoreResult[]): GlobalResult {
  const result: GlobalResult = {
    approvedYesterday: 0,
    approvedTotal: 0,
    monthlyTarget: 0,
    monthlyRatio: 0,
  };

  for (const store of stores) {
    result.approvedYesterday += store.approvedYesterday;
    result.approvedTotal += store.approvedTotal;
    result.monthlyTarget += store.monthlyTarget ?? 0;
  }

  result.monthlyRatio = result.monthlyTarget > 0 ? result.approvedTotal / result.monthlyTarget : 0;

  return result;
}

/**
 * WP2.4: Verificar integridade matemática (soma stores == soma groups == global)
 */
export function buildIntegrityCheck(
  stores: StoreResult[],
  groups: GroupResult[],
  global: GlobalResult
): IntegrityCheck {
  // Somas diretas das lojas
  const sumStoresYesterday = stores.reduce((sum, s) => sum + s.approvedYesterday, 0);
  const sumStoresTotal = stores.reduce((sum, s) => sum + s.approvedTotal, 0);
  const sumStoresTarget = stores.reduce((sum, s) => sum + (s.monthlyTarget ?? 0), 0);

  // Somas dos grupos
  const sumGroupsYesterday = groups.reduce((sum, g) => sum + g.approvedYesterday, 0);
  const sumGroupsTotal = groups.reduce((sum, g) => sum + g.approvedTotal, 0);
  const sumGroupsTarget = groups.reduce((sum, g) => sum + g.monthlyTarget, 0);

  // Diffs
  const diffs = {
    stores_vs_groups: {
      approvedYesterday: sumStoresYesterday - sumGroupsYesterday,
      approvedTotal: sumStoresTotal - sumGroupsTotal,
      monthlyTarget: sumStoresTarget - sumGroupsTarget,
    },
    stores_vs_global: {
      approvedYesterday: sumStoresYesterday - global.approvedYesterday,
      approvedTotal: sumStoresTotal - global.approvedTotal,
      monthlyTarget: sumStoresTarget - global.monthlyTarget,
    },
    groups_vs_global: {
      approvedYesterday: sumGroupsYesterday - global.approvedYesterday,
      approvedTotal: sumGroupsTotal - global.approvedTotal,
      monthlyTarget: sumGroupsTarget - global.monthlyTarget,
    },
  };

  // OK se todos os diffs forem zero
  const ok = Object.values(diffs).every((diff) =>
    Object.values(diff).every((val) => Math.abs(val) < 0.01)
  );

  return { ok, diffs };
}
