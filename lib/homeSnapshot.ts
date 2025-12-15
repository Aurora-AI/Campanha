// Adapter: transforms raw snapshot into a minimal UI model without calculations
// Rule: only select and rename existing fields. If a field is missing, keep it undefined
// and let the UI render elegant fallbacks.

export type PodiumItem = { group?: string; value?: number | string };
export type ChaseItem = { group?: string; gap?: number | string; value?: number | string };

export type HomeViewModel = {
  // Leader block
  leaderGroup?: string;
  leaderValue?: number | string;
  leaderGapToSecond?: number | string;

  // Podium Top 3
  top3?: PodiumItem[];

  // Optional chase list (closest followers)
  chase?: ChaseItem[];

  // Optional meta ruler
  metaRuler?: { goalLabel?: string; goalValue?: number | string };

  // Footer metadata
  publishedAt?: string;
  sourceFileName?: string;
  version?: string;
};

export function toHomeViewModel(snapshot: any): HomeViewModel {
  if (!snapshot || typeof snapshot !== "object") return {};

  // Footer metadata
  const publishedAt: string | undefined = snapshot.publishedAt;
  const sourceFileName: string | undefined = snapshot.sourceFileName;
  const version: string | undefined = snapshot.version;

  // Try to find presentation-friendly fields if they exist in the payload.
  // IMPORTANT: Do not compute or aggregate — only read existing fields.
  const payload = snapshot.data || snapshot.payload || {};
  const metrics = payload.metrics || {};

  // Leader structure (optional in snapshot)
  const leader = metrics.leader || payload.leader;
  const leaderGroup = leader?.groupName ?? leader?.group ?? undefined;
  const leaderValue = leader?.value ?? leader?.approved ?? undefined;
  const leaderGapToSecond = leader?.gapToSecond ?? leader?.gap ?? undefined;

  // Top 3 (optional)
  const top3Raw: any[] | undefined = metrics.top3 || payload.top3;
  const top3 = Array.isArray(top3Raw)
    ? top3Raw.map((item) => ({
        group: item?.groupName ?? item?.group,
        value: item?.value ?? item?.approved,
      }))
    : undefined;

  // Chase list (optional)
  const chaseRaw: any[] | undefined = metrics.chase || payload.chase || metrics.closest || payload.closest;
  const chase = Array.isArray(chaseRaw)
    ? chaseRaw.map((item) => ({
        group: item?.groupName ?? item?.group,
        gap: item?.gap ?? item?.distance,
        value: item?.value ?? item?.approved,
      }))
    : undefined;

  // Meta ruler (optional)
  const metaRulerRaw = metrics.metaRuler || payload.metaRuler;
  const metaRuler = metaRulerRaw
    ? {
        goalLabel: metaRulerRaw?.label ?? metaRulerRaw?.goalLabel,
        goalValue: metaRulerRaw?.value ?? metaRulerRaw?.goalValue,
      }
    : undefined;

  return {
    leaderGroup,
    leaderValue,
    leaderGapToSecond,
    top3,
    chase,
    metaRuler,
    publishedAt,
    sourceFileName,
    version,
  };
}
