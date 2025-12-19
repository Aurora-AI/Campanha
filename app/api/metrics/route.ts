import { NextResponse } from "next/server";
import { getCampaignMetrics } from "@/lib/server/campaignMetrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const result = await getCampaignMetrics();

  if (result.status === "not_found") {
    return new NextResponse("Dados não encontrados", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (result.status === "invalid_data") {
    return NextResponse.json(
      { error: "Dados inválidos: reenvie o CSV para gerar métricas." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (result.status === "dataset_error") {
    return NextResponse.json(
      { error: result.message ?? "Erro de validação do dataset" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (result.status === "error") {
    return NextResponse.json(
      { error: "Erro ao calcular métricas" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(result.payload, { status: 200, headers: { "Cache-Control": "no-store" } });
}
