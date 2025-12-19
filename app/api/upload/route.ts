import { NextResponse } from "next/server";
import { uploadCampaignCsv } from "@/lib/server/campaignUpload";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new NextResponse("CSV não enviado", {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const result = await uploadCampaignCsv(file);
    return NextResponse.json(result, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Erro ao processar/upload CSV:", error);
    return NextResponse.json(
      { ok: false, error: "Erro ao processar CSV" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
