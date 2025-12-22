import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyAdminCookie } from '@/lib/admin/auth';
import { loadMonthlyIndex } from '@/lib/server/monthlySnapshots';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
}

export async function GET(req: Request) {
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

    const index = await loadMonthlyIndex();
    if (!index) return new NextResponse(null, { status: 204 });
    return NextResponse.json(index, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'MONTHLY_INDEX_FAILED' }, { status: 500 });
  }
}

