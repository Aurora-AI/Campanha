import CampaignTrend from '@/components/editorial/CampaignTrend';
import DailyDonut from '@/components/editorial/DailyDonut';
import HeroGlass from '@/components/hero/HeroGlass';
import StoreTotalsLedger from '@/components/ledger/StoreTotalsLedger';
import TopYesterdayLedger from '@/components/ledger/TopYesterdayLedger';
import type { EditorialSummaryVM } from '@/lib/analytics/types';

function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  const port = process.env.PORT ?? '3000';
  return `http://localhost:${port}`;
}

function normalizeStatusLabel(label?: string): 'NO JOGO' | 'EM DISPUTA' | 'FORA DO RITMO' {
  const normalized = (label || '').toUpperCase().replace(/_/g, ' ').trim();
  if (normalized === 'NO JOGO') return 'NO JOGO';
  if (normalized === 'FORA DO RITMO') return 'FORA DO RITMO';
  return 'EM DISPUTA';
}

type StoreTotalsRow = { store: string; approvedTotal: number };
type TopYesterdayRow = { store: string; approvedYesterday: number };
type EditorialSummaryPayload = EditorialSummaryVM & {
  storeTotals?: StoreTotalsRow[];
  topYesterday?: TopYesterdayRow[];
};

async function getEditorialSummary(): Promise<EditorialSummaryPayload> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/editorial-summary`, { cache: 'no-store' });

  if (!res.ok) {
    return {
      updatedAtISO: new Date().toISOString(),
      hero: {
        headline: 'Aceleração 2025',
        subheadline: 'Evolução diária e insights estratégicos para a tomada de decisão.',
        kpiLabel: 'Aprovações (ontem)',
        kpiValue: '-',
        statusLabel: 'EM DISPUTA',
      },
      heroCards: {
        groupResultsYesterday: [],
        highlightStore: { store: '-' },
      },
      dailyResult: { approvedYesterday: 0, targetToday: 0, dayRatio: 0, statusLabel: 'EM DISPUTA' },
      storeResultsYesterday: [],
      storeTotals: [],
      topYesterday: [],
      campaignTrend: { points: [] },
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
    };
  }

  return res.json();
}

export default async function HomePage() {
  const vm = await getEditorialSummary();
  const statusLabel = normalizeStatusLabel(vm?.dailyResult?.statusLabel ?? vm?.hero?.statusLabel);
  const dailyResult = vm?.dailyResult;
  const approvedYesterday = dailyResult?.approvedYesterday ?? vm?.pulse?.approvedYesterday ?? 0;
  const targetToday = dailyResult?.targetToday ?? 0;
  const dayRatio = dailyResult?.dayRatio ?? 0;

  const storeTotals = Array.isArray(vm?.storeTotals) ? [...vm.storeTotals] : [];
  storeTotals.sort((a, b) => b.approvedTotal - a.approvedTotal || a.store.localeCompare(b.store));

  const topYesterday = Array.isArray(vm?.topYesterday) ? [...vm.topYesterday] : [];
  const topYesterdaySorted = topYesterday
    .filter((row) => row.approvedYesterday > 0)
    .sort((a, b) => b.approvedYesterday - a.approvedYesterday || a.store.localeCompare(b.store));
  const highlight = topYesterdaySorted[0];

  return (
    <main className="min-h-[100svh] bg-white">
      <HeroGlass
        backgroundSrc="/images/hero-final.png"
        title="Calceleve - Campanha aceleração 2025"
        subtitle={vm?.hero?.subheadline ?? 'Evolução diária e insights estratégicos para a tomada de decisão.'}
        meta={{ approvedYesterday, targetToday, dayRatio }}
        highlight={highlight}
      />

      <div className="mx-auto w-[min(1200px,92vw)] py-10 space-y-10">
        <section className="grid gap-6 lg:grid-cols-2">
          <StoreTotalsLedger rows={storeTotals} />
          <TopYesterdayLedger rows={topYesterdaySorted} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <DailyDonut
            approvedYesterday={approvedYesterday}
            targetToday={targetToday}
            dayRatio={dayRatio}
            statusLabel={dailyResult?.statusLabel ?? statusLabel}
            size={140}
            stroke={12}
            label="Ontem x meta do dia"
          />
          <CampaignTrend
            points={vm?.campaignTrend?.points ?? []}
            statusLabel={dailyResult?.statusLabel ?? statusLabel}
            compact
          />
        </section>
      </div>
    </main>
  );
}
