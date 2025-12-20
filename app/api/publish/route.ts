import { NextResponse } from 'next/server';
import { publishSnapshot } from '@/lib/publisher';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-admin-token') || '';
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

    if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) return unauthorized();

    const snapshot = await req.json();
    if (!snapshot || typeof snapshot !== 'object') {
      return NextResponse.json({ error: 'INVALID_SNAPSHOT' }, { status: 400 });
    }

    await publishSnapshot(snapshot);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'PUBLISH_FAILED' }, { status: 500 });
  }
}
