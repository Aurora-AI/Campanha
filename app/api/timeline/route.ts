import { NextResponse } from 'next/server';
import type { Snapshot } from '@/lib/analytics/types';
import { getLatestSnapshot } from '@/lib/publisher';
import { buildTimelineReport } from '@/lib/campaign/timelineReport';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const snapshot = (await getLatestSnapshot()) as Snapshot | null;
    const payload = buildTimelineReport(snapshot);
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'TIMELINE_FAILED' }, { status: 500 });
  }
}
