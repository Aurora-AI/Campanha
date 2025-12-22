import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { cookies } from 'next/headers';

import { verifyAdminCookie } from '@/lib/admin/auth';
import { getBlobToken } from '@/lib/publisher';
import { parseCalceleveCsv } from '@/lib/analytics/csv/parseCalceleveCsv';
import { normalizeProposals } from '@/lib/analytics/normalize/normalizeProposals';
import { computeSnapshot } from '@/lib/analytics/compute/computeSnapshot';
import { getCampaignConfig } from '@/lib/campaign/config';
import { loadMonthlyIndex, publishMonthlySnapshot } from '@/lib/server/monthlySnapshots';
import { getFormDataFileName, readFormDataFileText } from '@/lib/server/readUploadBlob';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: 'INVALID_REQUEST', message }, { status: 400 });
}

function parseIntSafe(input: unknown): number | null {
  const n = typeof input === 'number' ? input : Number(String(input ?? '').trim());
  if (!Number.isFinite(n)) return null;
  return parseInt(String(n), 10);
}

function truthyFlag(input: unknown): boolean {
  const v = String(input ?? '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
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
    const overwrite = truthyFlag(form.get('overwrite'));

    const year = parseIntSafe(yearRaw);
    const month = parseIntSafe(monthRaw);

    if (!year || year < 2000 || year > 2100) return badRequest('YEAR_INVALID');
    if (!month || month < 1 || month > 12) return badRequest('MONTH_INVALID');

    const cfg = getCampaignConfig();
    const tz = cfg.timezone;
    const nowTz = DateTime.now().setZone(tz);
    const currentYear = nowTz.year;
    const currentMonth = nowTz.month;

    if (year === currentYear && month === currentMonth) {
      return NextResponse.json(
        { error: 'CURRENT_MONTH_IS_LIVE', message: 'Mês corrente vem do Publicar CSV (/api/publish-csv).' },
        { status: 400 }
      );
    }
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return NextResponse.json({ error: 'MONTH_IN_FUTURE' }, { status: 400 });
    }

    const index = await loadMonthlyIndex();
    let exists = false;
    if (index?.months) {
      for (const m of index.months) {
        if (m.year === year && m.month === month) {
          exists = true;
          break;
        }
      }
    }
    if (exists && !overwrite) {
      return NextResponse.json(
        { error: 'MONTH_ALREADY_EXISTS', message: 'Mês já existe no histórico. Marque overwrite para substituir.' },
        { status: 409 }
      );
    }

    const text = await readFormDataFileText(file);
    if (text === null) return badRequest('MISSING_FILE');

    const parsed = await parseCalceleveCsv(text);
    if (!parsed.ok) return badRequest(parsed.error);

    const proposals = normalizeProposals(parsed.value.rows);
    if (proposals.length === 0) return badRequest('EMPTY_DATASET');

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
    const sourceFileName = getFormDataFileName(file, 'upload.csv');

    const next = await publishMonthlySnapshot({ year, month, sourceFileName, snapshot, allowOverwrite: overwrite });
    return NextResponse.json(
      {
        ok: true,
        current: next.current,
        months: next.months.length,
        updatedAtISO: next.updatedAtISO,
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
