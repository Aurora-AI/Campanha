import { NextResponse } from "next/server";
import { uploadCampaignCsv } from "@/lib/server/campaignUpload";
import { parseCalceleveCsv } from "@/lib/analytics/csv/parseCalceleveCsv";
import { normalizeProposals } from "@/lib/analytics/normalize/normalizeProposals";
import { computeSnapshot } from "@/lib/analytics/compute/computeSnapshot";
import { publishSnapshot } from "@/lib/publisher";

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

    const text = await file.text();
    const result = await uploadCampaignCsv(text, file.name);

    const rows = parseCalceleveCsv(text);
    const proposals = normalizeProposals(rows);
    const snapshot = computeSnapshot(proposals);
    await publishSnapshot(snapshot);

    return NextResponse.json(
      { ...result, snapshotPublished: true },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Erro ao processar/upload CSV:", error);
    return NextResponse.json(
      { ok: false, error: "Erro ao processar CSV" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
