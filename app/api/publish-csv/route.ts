import { NextResponse } from 'next/server';
import { parseCalceleveCsv } from '@/lib/analytics/csv/parseCalceleveCsv';
import { normalizeProposals } from '@/lib/analytics/normalize/normalizeProposals';
import { computeSnapshot } from '@/lib/analytics/compute/computeSnapshot';
import { createBlobPublisher, getBlobToken, type MetricsPublisher } from '@/lib/publisher';
import { verifyAdminCookie } from '@/lib/admin/auth';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
}

type PublishHandlerOptions = {
  publisher?: MetricsPublisher;
  requireToken?: boolean;
};

type FileLike = {
  text?: () => Promise<string>;
  arrayBuffer?: () => Promise<ArrayBuffer>;
  name?: string;
};

function isFileLike(value: unknown): value is FileLike | Blob {
  return (
    !!value &&
    typeof value === 'object' &&
    (typeof (value as FileLike).text === 'function' ||
      typeof (value as FileLike).arrayBuffer === 'function' ||
      (typeof Blob !== 'undefined' && value instanceof Blob))
  );
}

async function readFileText(file: FileLike | Blob): Promise<string> {
  const textFn = (file as FileLike).text;
  if (typeof textFn === 'function') return textFn();

  const arrayBufferFn = (file as FileLike).arrayBuffer;
  if (typeof arrayBufferFn === 'function') {
    const buffer = await arrayBufferFn();
    return new TextDecoder().decode(buffer);
  }
  if (typeof FileReader !== 'undefined' && typeof Blob !== 'undefined' && file instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
      reader.readAsText(file);
    });
  }
  return '';
}

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

      const text = typeof file === 'string' ? file : isFileLike(file) ? await readFileText(file) : null;

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
      logRouteStatus(500, error instanceof Error ? 'publisher_error' : 'unknown_error');
      return NextResponse.json(
        { error: 'PUBLISH_CSV_FAILED', message: error instanceof Error ? error.message : 'Erro interno' },
        { status: 500 }
      );
    }
  };
}

export const POST = createPublishCsvHandler();
