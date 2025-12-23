/**
 * Tabela canônica de metas mensais e agrupamento de lojas
 * OS-MYCELIUM-GROUPS-METAS-001
 */

/**
 * Meta mensal total da campanha
 */
export const campaignMonthlyTarget = 658;

/**
 * Mapeamento: código da loja → meta mensal
 */
export const storeMonthlyTargetByCode: Record<number, number> = {
  // Grupo A — Alto Potencial
  12: 89,
  15: 70,
  11: 68,

  // Grupo B — Médio Potencial
  21: 51,
  20: 48,
  4: 49,
  19: 37,
  5: 33,
  7: 32,
  13: 29,
  3: 26,
  10: 25,

  // Grupo C — Desenvolvimento
  1: 20,
  9: 19,
  17: 19,
  2: 19,
  6: 18,
  14: 15,
  8: 14,
  18: 13,
  16: 10,
};

/**
 * Mapeamento: código da loja → grupo (A/B/C)
 */
export const groupByStoreCode: Record<number, 'A' | 'B' | 'C'> = {
  // Grupo A — Alto Potencial
  12: 'A',
  15: 'A',
  11: 'A',

  // Grupo B — Médio Potencial
  21: 'B',
  20: 'B',
  4: 'B',
  19: 'B',
  5: 'B',
  7: 'B',
  13: 'B',
  3: 'B',
  10: 'B',

  // Grupo C — Desenvolvimento
  1: 'C',
  9: 'C',
  17: 'C',
  2: 'C',
  6: 'C',
  14: 'C',
  8: 'C',
  18: 'C',
  16: 'C',
};

/**
 * Extrai o código numérico da loja de um campo store completo
 * Ex: "LOJA 12 — ARAUCÁRIA CENTRO" → 12
 */
export function extractStoreCode(store: string): number | null {
  const match = store.match(/LOJA\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Resolve o grupo da loja baseado no código
 * Retorna 'C' como fallback se não encontrado
 */
export function getStoreGroup(storeCode: number | null): 'A' | 'B' | 'C' {
  if (storeCode === null) return 'C';
  return groupByStoreCode[storeCode] ?? 'C';
}

/**
 * Retorna a meta mensal da loja baseado no código
 * Retorna null se não mapeada
 */
export function getStoreMonthlyTarget(storeCode: number | null): number | null {
  if (storeCode === null) return null;
  return storeMonthlyTargetByCode[storeCode] ?? null;
}
