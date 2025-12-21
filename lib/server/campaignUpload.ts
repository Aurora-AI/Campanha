import { put } from "@vercel/blob";
import Papa from "papaparse";
import { detectHeaderAndRows } from "@/lib/metrics/normalize";
import { detectDelimiter } from "@/lib/csv";

type UploadResponse = {
  ok: true;
  rows: number;
  skippedPreambleRows: number;
  url: string;
};

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

export async function uploadCampaignCsv(csvText: string, sourceName: string): Promise<UploadResponse> {
  const rawRows = await parseCsvText(csvText);
  const { header, rows, headerIndex } = detectHeaderAndRows(rawRows);
  const strippedRows = [header, ...rows];

  const payload = {
    meta: {
      source: sourceName,
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

  return {
    ok: true,
    rows: payload.meta.rows,
    skippedPreambleRows: payload.meta.skippedPreambleRows,
    url: blob.url,
  };
}
