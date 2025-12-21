import { NextResponse } from 'next/server';
import { getLatestSnapshot } from '@/lib/publisher';
import { getCampaignConfig } from '@/lib/campaign/config';
import { buildEditorialSummaryPayload } from '@/lib/campaign/editorialSummary';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const snapshot = await getLatestSnapshot();
    const payload = buildEditorialSummaryPayload({
      snapshot,
      config: getCampaignConfig(),
    });
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'SUMMARY_FAILED' }, { status: 500 });
  }
}
