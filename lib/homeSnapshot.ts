import type { SandboxData as HomeViewModel } from '@/lib/campaign/mock';
import { adaptSnapshotToCampaign, type AdaptCampaignOptions } from '@/lib/campaign/adapter';

export type { HomeViewModel };

export function toHomeViewModel(snapshot: unknown, options: AdaptCampaignOptions = {}): HomeViewModel {
  return adaptSnapshotToCampaign(snapshot, options);
}
