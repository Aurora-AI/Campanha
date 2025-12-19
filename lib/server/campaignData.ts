import { head } from "@vercel/blob";

type AnyRecord = Record<string, unknown>;

function sanitizePayload(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;
  const record = input as AnyRecord;
  if (!("meta" in record)) return input;

  const metaObj = record.meta;
  if (!metaObj || typeof metaObj !== "object") return input;

  const metaRec = metaObj as AnyRecord;
  // Drop debug fields that are not meant for public usage.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { headers, skippedPreambleRows, ...safeMeta } = metaRec;

  return { ...record, meta: safeMeta };
}

export async function fetchCampaignData(): Promise<unknown | null> {
  const blobInfo = await head("campanha-data.json");
  if (!blobInfo?.url) return null;

  const url = new URL(blobInfo.url);
  url.searchParams.set("t", String(Date.now()));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;

  const json = await res.json();
  return sanitizePayload(json);
}
