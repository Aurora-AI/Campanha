import { computeMetrics, isColumnNotFoundError, isDatasetError } from "@/lib/metrics/compute";
import { fetchCampaignData } from "@/lib/server/campaignData";

type MetricsOutcome =
  | { status: "ok"; payload: ReturnType<typeof computeMetrics> }
  | { status: "not_found" }
  | { status: "invalid_data" }
  | { status: "dataset_error"; message?: string }
  | { status: "error" };

type AnyRecord = Record<string, unknown>;

export async function getCampaignMetrics(): Promise<MetricsOutcome> {
  try {
    const json = await fetchCampaignData();
    if (!json) return { status: "not_found" };

    const root = json && typeof json === "object" ? (json as AnyRecord) : null;
    const metaObj = (root?.meta && typeof root.meta === "object" ? (root.meta as AnyRecord) : null) ?? null;
    const uploadedAt = typeof metaObj?.uploadedAt === "string" ? metaObj.uploadedAt : new Date().toISOString();

    const dataObj = (root?.data && typeof root.data === "object" ? (root.data as AnyRecord) : null) ?? null;

    const rowsCandidate =
      (dataObj?.rows as unknown) ??
      (dataObj?.rawRows as unknown) ??
      (dataObj?.rawCsv as unknown) ??
      (dataObj?.raw as unknown);

    const rawRows =
      Array.isArray(rowsCandidate) && rowsCandidate.every((r) => Array.isArray(r))
        ? (rowsCandidate as string[][])
        : null;

    if (!rawRows) return { status: "invalid_data" };

    const payload = computeMetrics({ uploadedAt, rawRows });
    return { status: "ok", payload };
  } catch (err) {
    if (isColumnNotFoundError(err) || isDatasetError(err)) {
      return { status: "dataset_error", message: err instanceof Error ? err.message : undefined };
    }

    console.error("GET /api/metrics: error", err);
    return { status: "error" };
  }
}
