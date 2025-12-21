import { NextResponse, type NextRequest } from 'next/server';
import type { Snapshot } from '@/lib/analytics/types';
import { getLatestSnapshot } from '@/lib/publisher';
import { buildStoresReport, type StoreSortKey } from '@/lib/campaign/storesReport';

export const runtime = 'nodejs';

function resolveSortKey(input: string | null): StoreSortKey {
  if (input === 'submittedTotal') return 'submittedTotal';
  if (input === 'approvalRateTotal') return 'approvalRateTotal';
  if (input === 'approvedYesterday') return 'approvedYesterday';
  return 'approvedTotal';
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const query = params.get('q') ?? '';
    const sortKey = resolveSortKey(params.get('sort'));
    const snapshot = (await getLatestSnapshot()) as Snapshot | null;
    const payload = buildStoresReport(snapshot, { query, sortKey });
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'STORES_FAILED' }, { status: 500 });
  }
}
