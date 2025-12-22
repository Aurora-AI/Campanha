import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { cookies } from 'next/headers';

import { verifyAdminCookie } from '@/lib/admin/auth';
import { getBlobToken } from '@/lib/publisher';
import { parseCalceleveCsv } from '@/lib/analytics/csv/parseCalceleveCsv';
import { normalizeProposals } from '@/lib/analytics/normalize/normalizeProposals';
import { computeSnapshot } from '@/lib/analytics/compute/computeSnapshot';
import { getCampaignConfig } from '@/lib/campaign/config';
import { publishMonthlySnapshot } from '@/lib/server/monthlySnapshots';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: 'INVALID_REQUEST', message }, { status: 400 });
}

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

function parseIntSafe(input: unknown): number | null {
  const n = typeof input === 'number' ? input : Number(String(input ?? '').trim());
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function POST(req: Request) {
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

    if (!getBlobToken()) return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN' }, { status: 503 });

    const form = await req.formData();
    const file = form.get('file');
    const yearRaw = form.get('year');
    const monthRaw = form.get('month');

    const year = parseIntSafe(yearRaw);
    const month = parseIntSafe(monthRaw);

    if (!year || year < 2000 || year > 2100) return badRequest('YEAR_INVALID');
    if (!month || month < 1 || month > 12) return badRequest('MONTH_INVALID');
    if (!isFileLike(file)) return badRequest('MISSING_FILE');

    const text = await readFileText(file);
    const parsed = await parseCalceleveCsv(text);
    if (!parsed.ok) return badRequest(parsed.error);

    const proposals = normalizeProposals(parsed.value.rows);
    if (proposals.length === 0) return badRequest('EMPTY_DATASET');

    const cfg = getCampaignConfig();
    const tz = cfg.timezone;

    const isInMonth = (iso: string): boolean => {
      const dt = DateTime.fromISO(iso, { zone: tz }).startOf('day');
      return dt.isValid && dt.year === year && dt.month === month;
    };

    const days = new Set<string>();
    for (const p of proposals) {
      days.add(p.entryDateISO);
      if (!isInMonth(p.entryDateISO)) return badRequest('ENTRY_DATE_OUTSIDE_MONTH');
      if (p.finalizedDateISO && !isInMonth(p.finalizedDateISO)) return badRequest('FINALIZED_DATE_OUTSIDE_MONTH');
    }
    if (days.size > 31) return badRequest('TOO_MANY_DAYS');

    const snapshot = computeSnapshot(proposals);
    const sourceFileName = typeof (file as FileLike).name === 'string' ? String((file as FileLike).name) : 'upload.csv';

    const index = await publishMonthlySnapshot({ year, month, sourceFileName, snapshot });
    return NextResponse.json(
      {
        ok: true,
        current: index.current,
        months: index.months.length,
        updatedAtISO: index.updatedAtISO,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'PUBLISH_MONTH_FAILED', message: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}

