import { NextResponse } from 'next/server';
import { getLatestSnapshot } from '@/lib/publisher';

export const runtime = 'nodejs';

function isProd() {
  return process.env.NODE_ENV === 'production';
}

export async function GET() {
  try {
    const latest = await getLatestSnapshot();

    if (latest) {
      return NextResponse.json(latest, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }

    if (!isProd()) {
      return NextResponse.json(
        {
          schemaVersion: 'campaign-snapshot/v1',
          campaign: { campaignId: 'dev', campaignName: 'DEV', timezone: 'America/Sao_Paulo' },
          updatedAtISO: new Date().toISOString(),
          proposals: [],
          storeMetrics: [],
          editorialSummary: {
            updatedAtISO: new Date().toISOString(),
            hero: {
              headline: 'Sem publicacao ainda (DEV)',
              subheadline: 'Publique um CSV via /admin para alimentar o dashboard.',
              kpiLabel: 'Aprovacoes (ontem)',
              kpiValue: '-',
              statusLabel: 'EM DISPUTA',
            },
            pulse: { approvedYesterday: 0, submittedYesterday: 0, approvalRateYesterday: 0, dayKeyYesterday: '-' },
            totals: { approved: 0, submitted: 0, approvalRate: 0 },
            comparatives: [],
            highlights: {
              topStoreByApproved: { store: '-', value: 0 },
              topStoreByApprovalRate: { store: '-', value: 0 },
              topStoreBySubmitted: { store: '-', value: 0 },
            },
            top3: [
              { rank: 1, name: '-', value: '-' },
              { rank: 2, name: '-', value: '-' },
              { rank: 3, name: '-', value: '-' },
            ],
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'NO_SNAPSHOT', message: 'Nenhum snapshot publicado. Publique via /admin.' },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { error: 'LATEST_FAILED', message: 'Falha ao carregar snapshot latest.' },
      { status: 500 }
    );
  }
}
