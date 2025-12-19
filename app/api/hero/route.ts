import { NextResponse } from "next/server";
import { loadHeroPayload } from "@/lib/hero/loadHeroPayload";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const result = await loadHeroPayload();
    if (result.status === "empty") {
      return new NextResponse("Dados não encontrados", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return NextResponse.json(result.payload, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("GET /api/hero: error", err);
    return NextResponse.json(
      { error: "Erro ao montar Hero" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
