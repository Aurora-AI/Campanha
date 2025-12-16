import { NextResponse } from "next/server";
import { head } from "@vercel/blob";
import { computeMetrics, isColumnNotFoundError, isDatasetError } from "@/lib/metrics/compute";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const meta = await head("campanha-data.json");
    if (!meta?.url) {
      return new NextResponse("Dados não encontrados", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const url = new URL(meta.url);
    url.searchParams.set("t", String(Date.now()));

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return new NextResponse("Dados não encontrados", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

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
      return NextResponse.json(
        { error: "Dados inválidos: reenvie o CSV para gerar métricas." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const payload = computeMetrics({ uploadedAt, rawRows });
    return NextResponse.json(payload, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (isColumnNotFoundError(err) || isDatasetError(err)) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Erro de validação do dataset" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    console.error("GET /api/metrics: error", err);
    return NextResponse.json(
      { error: "Erro ao calcular métricas" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

