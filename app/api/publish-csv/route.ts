import { NextResponse } from 'next/server';
import { parseCalceleveCsv } from '@/lib/analytics/csv/parseCalceleveCsv';
import { normalizeProposals } from '@/lib/analytics/normalize/normalizeProposals';
import { computeSnapshot } from '@/lib/analytics/compute/computeSnapshot';
import { publishSnapshot } from '@/lib/publisher';
import { verifyAdminCookie } from '@/lib/admin/auth';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-admin-token') || '';
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
    const headerOk = !!ADMIN_TOKEN && token === ADMIN_TOKEN;
    const cookieStore = await cookies();
    const cookie = cookieStore.get('mycelium_admin')?.value;
    const cookieOk = cookie ? await verifyAdminCookie(cookie) : false;
    if (!headerOk && !cookieOk) return unauthorized();

    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'MISSING_FILE' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCalceleveCsv(text);
    const proposals = normalizeProposals(rows);
    const snapshot = computeSnapshot(proposals);

    await publishSnapshot(snapshot);

    return NextResponse.json({ ok: true, proposals: proposals.length }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'PUBLISH_CSV_FAILED' }, { status: 500 });
  }
}
