import { NextResponse } from 'next/server';
import { getLatestSnapshot } from '@/lib/publisher';
import { getCampaignConfig } from '@/lib/campaign/config';
import { buildEditorialSummaryPayload } from '@/lib/campaign/editorialSummary';
import { buildStoreResults, buildGroupResults, buildGlobalResult, buildIntegrityCheck } from '@/lib/campaign/truthline';
import type { TruthlinePayload } from '@/lib/analytics/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const snapshot = await getLatestSnapshot();
    const config = getCampaignConfig();
    
    // Pipeline única de verdade (OS-MYCELIUM-TRUTHLINE-003)
    const stores = buildStoreResults(snapshot);
    const groups = buildGroupResults(stores);
    const global = buildGlobalResult(stores);
    const integrity = buildIntegrityCheck(stores, groups, global);
    
    // Campos derivados para compatibilidade com UI existente
    const legacyPayload = buildEditorialSummaryPayload({ snapshot, config });
    
    const buildSha = process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown';
    
    const truthlinePayload: TruthlinePayload = {
      updatedAtISO: new Date().toISOString(),
      buildSha,
      stores,
      groups,
      global,
      integrity,
      // Campos derivados (espelhos da truthline)
      hero: legacyPayload.hero,
      heroCards: {
        groupResultsYesterday: groups.map(g => ({
          group: `Grupo ${g.groupCode}`,
          approvedYesterday: g.approvedYesterday
        })),
        highlightStore: legacyPayload.heroCards?.highlightStore ?? { store: '-' }
      },
      dailyResult: {
        approvedYesterday: global.approvedYesterday,
        targetToday: legacyPayload.dailyResult?.targetToday ?? 0,
        dayRatio: legacyPayload.dailyResult?.dayRatio ?? 0,
        statusLabel: legacyPayload.dailyResult?.statusLabel ?? 'EM DISPUTA'
      },
      pulse: legacyPayload.pulse,
      totals: {
        approved: global.approvedTotal,
        submitted: legacyPayload.totals.submitted,
        approvalRate: legacyPayload.totals.approvalRate
      },
      comparatives: legacyPayload.comparatives,
      highlights: legacyPayload.highlights,
      top3: legacyPayload.top3,
      campaignTrend: legacyPayload.campaignTrend
    };
    
    return NextResponse.json(truthlinePayload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch {
    return NextResponse.json({ error: 'SUMMARY_FAILED' }, { status: 500 });
  }
}

