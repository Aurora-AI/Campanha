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

export function toHomeViewModel(snapshot: unknown): HomeViewModel {
  if (!snapshot || typeof snapshot !== "object") return {};

  const root = snapshot as Record<string, unknown>;

  // Footer metadata
  const publishedAt = typeof root.publishedAt === "string" ? root.publishedAt : undefined;
  const sourceFileName = typeof root.sourceFileName === "string" ? root.sourceFileName : undefined;
  const version = typeof root.version === "string" ? root.version : undefined;

  // Try to find presentation-friendly fields inside the official snapshot data.
  // IMPORTANT: Do not compute or aggregate — only read existing fields.
  const dataVal = (root as { data?: unknown }).data;
  const payload = (dataVal && typeof dataVal === "object" ? (dataVal as Record<string, unknown>) : {}) as Record<string, unknown>;

  const metricsVal = (payload as { metrics?: unknown }).metrics;
  const metrics = (metricsVal && typeof metricsVal === "object" ? (metricsVal as Record<string, unknown>) : {}) as Record<string, unknown>;

  // Leader structure (optional in snapshot)
  const leaderVal = (metrics as { leader?: unknown }).leader;
  const leader = leaderVal && typeof leaderVal === "object" ? (leaderVal as Record<string, unknown>) : undefined;
  const leaderGroup = (leader?.groupName as string | undefined) ?? (leader?.group as string | undefined) ?? undefined;
  const leaderValue = (leader?.value as number | string | undefined) ?? (leader?.approved as number | string | undefined) ?? undefined;
  const leaderGapToSecond = (leader?.gapToSecond as number | string | undefined) ?? (leader?.gap as number | string | undefined) ?? undefined;

  // Top 3 (optional)
  const top3Raw = (metrics as { top3?: unknown }).top3;
  const top3Arr = Array.isArray(top3Raw) ? top3Raw : undefined;
  const top3 = top3Arr
    ? top3Arr.map((item) => {
        const it = item && typeof item === "object" ? (item as Record<string, unknown>) : undefined;
        return {
          group: (it?.groupName as string | undefined) ?? (it?.group as string | undefined),
          value: (it?.value as number | string | undefined) ?? (it?.approved as number | string | undefined),
        };
      })
    : undefined;

  // Chase list (optional)
  const chaseRawA = (metrics as { chase?: unknown }).chase;
  const chaseRawB = (metrics as { closest?: unknown }).closest;
  const chaseArr = Array.isArray(chaseRawA) ? chaseRawA : Array.isArray(chaseRawB) ? chaseRawB : undefined;
  const chase = chaseArr
    ? chaseArr.map((item) => {
        const it = item && typeof item === "object" ? (item as Record<string, unknown>) : undefined;
        return {
          group: (it?.groupName as string | undefined) ?? (it?.group as string | undefined),
          gap: (it?.gap as number | string | undefined) ?? (it?.distance as number | string | undefined),
          value: (it?.value as number | string | undefined) ?? (it?.approved as number | string | undefined),
        };
      })
    : undefined;

  // Meta ruler (optional)
  const metaRulerVal = (metrics as { metaRuler?: unknown }).metaRuler;
  const metaRulerObj = metaRulerVal && typeof metaRulerVal === "object" ? (metaRulerVal as Record<string, unknown>) : undefined;
  const metaRuler = metaRulerObj
    ? {
        goalLabel: (metaRulerObj?.label as string | undefined) ?? (metaRulerObj?.goalLabel as string | undefined),
        goalValue: (metaRulerObj?.value as number | string | undefined) ?? (metaRulerObj?.goalValue as number | string | undefined),
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
