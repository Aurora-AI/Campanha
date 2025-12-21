import { NextResponse } from "next/server";
import { uploadCampaignCsv } from "@/lib/server/campaignUpload";
import { parseCalceleveCsv } from "@/lib/analytics/csv/parseCalceleveCsv";
import { normalizeProposals } from "@/lib/analytics/normalize/normalizeProposals";
import { computeSnapshot } from "@/lib/analytics/compute/computeSnapshot";
import { createBlobPublisher, getBlobToken, type MetricsPublisher } from "@/lib/publisher";

export const dynamic = "force-dynamic";

type UploadHandlerOptions = {
  publisher?: MetricsPublisher;
  requireToken?: boolean;
};

type FileLike = {
  text: () => Promise<string>;
  name?: string;
};

function isFileLike(value: unknown): value is FileLike {
  return !!value && typeof (value as FileLike).text === "function";
}

function logRouteStatus(status: number, cause: string) {
  console.error(`POST /api/upload ${status} ${cause}`);
}

function missingTokenResponse() {
  logRouteStatus(503, "missing_token");
  return NextResponse.json(
    { ok: false, error: "Missing BLOB_READ_WRITE_TOKEN" },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

export function createUploadHandler(options: UploadHandlerOptions = {}) {
  const publisher = options.publisher ?? createBlobPublisher();
  const requireToken = options.requireToken ?? true;

  return async function POST(req: Request) {
    try {
      if (requireToken && !getBlobToken()) {
        return missingTokenResponse();
      }

      const formData = await req.formData();
      const file = formData.get("file");

      if (!isFileLike(file)) {
        logRouteStatus(400, "missing_file");
        return NextResponse.json(
          { ok: false, error: "MISSING_FILE" },
          { status: 400, headers: { "Cache-Control": "no-store" } }
        );
      }

      const text = await file.text();
      const parsed = await parseCalceleveCsv(text);
      if (!parsed.ok) {
        logRouteStatus(400, "invalid_payload");
        return NextResponse.json(
          { ok: false, error: parsed.error },
          { status: 400, headers: { "Cache-Control": "no-store" } }
        );
      }

      const fileName = typeof file.name === "string" ? file.name : "upload.csv";
      const result = await uploadCampaignCsv(text, fileName);
      const proposals = normalizeProposals(parsed.value.rows);
      const snapshot = computeSnapshot(proposals);
      await publisher.publishMetrics(snapshot);

      return NextResponse.json(
        { ...result, snapshotPublished: true },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      logRouteStatus(500, error instanceof Error ? "publisher_error" : "unknown_error");
      return NextResponse.json(
        { ok: false, error: "UPLOAD_FAILED" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }
  };
}

export const POST = createUploadHandler();
