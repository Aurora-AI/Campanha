import { NextResponse } from "next/server";
import { fetchCampaignData } from "@/lib/server/campaignData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const payload = await fetchCampaignData();
    if (!payload) {
      return new NextResponse("Dados não encontrados", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return new NextResponse("Dados não encontrados", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
