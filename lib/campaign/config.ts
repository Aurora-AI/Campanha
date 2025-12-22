import fs from 'node:fs';
import path from 'node:path';
import { normalizeCnpjDigits, resolveStoreNameFromCnpj, STORE_BY_CNPJ_DIGITS } from '@/lib/campaign/storeCatalog';

export type CampaignConfig = {
  campaignId: string;
  campaignName: string;
  taglinePt: string;
  campaignStartISO: string;
  campaignEndISO: string;
  timezone: string;
  weekStartsOn: 'monday' | 'sunday';
  useFinalizedDateForApprovals: boolean;
  weeklyTargetPerStoreByGroup: Record<string, number>;
  storeByCnpjDigits?: Record<string, string>;
  groupByStorePrefix: Record<string, string>;
};

let cached: CampaignConfig | null = null;

export function getCampaignConfig(): CampaignConfig {
  if (cached) return cached;

  const p = path.join(process.cwd(), 'config', 'campaign.config.json');
  const raw = fs.readFileSync(p, 'utf-8');
  const parsed = JSON.parse(raw) as CampaignConfig;
  cached = {
    ...parsed,
    storeByCnpjDigits: {
      ...(parsed.storeByCnpjDigits ?? {}),
      ...STORE_BY_CNPJ_DIGITS,
    },
  };

  return cached;
}

export function cnpjDigits(cnpj: string): string {
  return normalizeCnpjDigits(cnpj);
}

export function resolveStoreName(cnpj: string, cfg: CampaignConfig): string {
  const resolved = resolveStoreNameFromCnpj(cnpj);
  if (resolved) return resolved;
  const digits = cnpjDigits(cnpj);
  const mapped = cfg.storeByCnpjDigits?.[digits];
  return mapped ?? `LOJA DESCONHECIDA (${digits || 'SEM CNPJ'})`;
}

export function resolveGroup(storeName: string, cfg: CampaignConfig): string {
  const prefix = storeName.split(' ').slice(0, 2).join(' ');
  return cfg.groupByStorePrefix[prefix] ?? 'Sem Grupo';
}

export function countStoresByGroup(cfg: CampaignConfig): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const group of Object.values(cfg.groupByStorePrefix)) {
    counts[group] = (counts[group] ?? 0) + 1;
  }
  return counts;
}

export function weeklyTargetTotal(cfg: CampaignConfig): number {
  const counts = countStoresByGroup(cfg);
  return Object.entries(counts).reduce((sum, [group, count]) => {
    const perStore = cfg.weeklyTargetPerStoreByGroup[group] ?? 0;
    return sum + perStore * count;
  }, 0);
}
