import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import Papa from "papaparse";
import { detectHeaderAndRows } from "@/lib/metrics/normalize";
import { detectDelimiter } from "@/lib/csv";

export const dynamic = "force-dynamic";

const parseCsvText = (csvText: string): Promise<string[][]> =>
  new Promise((resolve, reject) => {
    const delimiter = detectDelimiter(csvText);
    Papa.parse(csvText, {
      encoding: "UTF-8",
      delimiter,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as string[][]),
      error: (err: unknown) => reject(err),
    });
  });

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

    const csvText = await file.text();
    const rawRows = await parseCsvText(csvText);
    const { header, rows, headerIndex } = detectHeaderAndRows(rawRows);
    const strippedRows = [header, ...rows];

    const payload = {
      meta: {
        source: file.name,
        uploadedAt: new Date().toISOString(),
        rows: strippedRows.length,
        skippedPreambleRows: headerIndex,
        headers: header,
      },
      data: { rows: strippedRows },
    };

    const blob = await put("campanha-data.json", JSON.stringify(payload), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json(
      {
        ok: true,
        rows: payload.meta.rows,
        skippedPreambleRows: payload.meta.skippedPreambleRows,
        url: blob.url,
      },
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
