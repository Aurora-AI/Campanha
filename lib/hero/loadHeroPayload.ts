import { head } from "@vercel/blob";

import { computeMetrics } from "@/lib/metrics/compute";
import { buildHeroPayload } from "@/lib/hero/buildHeroPayload";
import type { HeroPayload } from "@/schemas/hero.schema";

export type HeroLoadResult =
  | { status: "empty" }
  | { status: "ok"; payload: HeroPayload };

export async function loadHeroPayload(): Promise<HeroLoadResult> {
  const meta = await head("campanha-data.json");
  if (!meta?.url) return { status: "empty" };

  const url = new URL(meta.url);
  url.searchParams.set("t", String(Date.now()));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return { status: "empty" };

  const json = (await res.json()) as unknown;
  const root = json && typeof json === "object" ? (json as Record<string, unknown>) : null;

  const metaObj = (root?.meta && typeof root.meta === "object" ? (root.meta as Record<string, unknown>) : null) ?? null;
  const uploadedAt = typeof metaObj?.uploadedAt === "string" ? metaObj.uploadedAt : new Date().toISOString();

  const dataObj = (root?.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : null) ?? null;

  const rowsCandidate =
    (dataObj?.rows as unknown) ??
    (dataObj?.rawRows as unknown) ??
    (dataObj?.rawCsv as unknown) ??
    (dataObj?.raw as unknown);

  const rawRows =
    Array.isArray(rowsCandidate) && rowsCandidate.every((r) => Array.isArray(r))
      ? (rowsCandidate as string[][])
      : null;

  if (!rawRows) {
    throw new Error("Dados inválidos: reenvie o CSV para gerar métricas.");
  }

  const metrics = computeMetrics({ uploadedAt, rawRows });
  const payload = buildHeroPayload(metrics);
  return { status: "ok", payload };
}

