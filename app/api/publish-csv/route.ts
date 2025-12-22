import { NextResponse } from 'next/server';
import { parseCalceleveCsv } from '@/lib/analytics/csv/parseCalceleveCsv';
import { normalizeProposals } from '@/lib/analytics/normalize/normalizeProposals';
import { computeSnapshot } from '@/lib/analytics/compute/computeSnapshot';
import { createBlobPublisher, getBlobToken, type MetricsPublisher } from '@/lib/publisher';
import { verifyAdminCookie } from '@/lib/admin/auth';
import { readFormDataFileText } from '@/lib/server/readUploadBlob';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
}

type PublishHandlerOptions = {
  publisher?: MetricsPublisher;
  requireToken?: boolean;
};

function logRouteStatus(status: number, cause: string) {
  console.error(`POST /api/publish-csv ${status} ${cause}`);
}

function missingTokenResponse() {
  logRouteStatus(503, 'missing_token');
  return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN' }, { status: 503 });
}

export function createPublishCsvHandler(options: PublishHandlerOptions = {}) {
  const publisher = options.publisher ?? createBlobPublisher();
  const requireToken = options.requireToken ?? true;

  return async function POST(req: Request) {
    try {
      const token = req.headers.get('x-admin-token') || '';
      const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
      const headerOk = !!ADMIN_TOKEN && token === ADMIN_TOKEN;
      let cookieOk = false;
      if (!headerOk) {
        try {
          const cookieStore = await cookies();
          const cookie = cookieStore.get('mycelium_admin')?.value;
          cookieOk = cookie ? await verifyAdminCookie(cookie) : false;
        } catch {
          cookieOk = false;
        }
      }
      if (!headerOk && !cookieOk) return unauthorized();

      if (requireToken && !getBlobToken()) {
        return missingTokenResponse();
      }

      const form = await req.formData();
      const file = form.get('file');
      const text = await readFormDataFileText(file);

      if (text === null) {
        logRouteStatus(400, 'missing_file');
        return NextResponse.json({ error: 'MISSING_FILE' }, { status: 400 });
      }

      const parsed = await parseCalceleveCsv(text);
      if (!parsed.ok) {
        logRouteStatus(400, 'invalid_payload');
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }

      const proposals = normalizeProposals(parsed.value.rows);
      const snapshot = computeSnapshot(proposals);

      await publisher.publishMetrics(snapshot);

      return NextResponse.json({ ok: true, proposals: proposals.length }, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_error';
      logRouteStatus(500, message);
      return NextResponse.json(
        { error: 'PUBLISH_CSV_FAILED', message: error instanceof Error ? error.message : 'Erro interno' },
        { status: 500 }
      );
    }
  };
}

export const POST = createPublishCsvHandler();
