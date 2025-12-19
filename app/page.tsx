import HeroGlass from '@/components/hero/HeroGlass';
import EditorialSummary from '@/components/editorial/EditorialSummary';
import EditorialNav from '@/components/navigation/EditorialNav';
import type { EditorialSummaryVM } from '@/lib/viewmodels/editorialSummary.vm';

async function getEditorialSummary(): Promise<EditorialSummaryVM> {
  try {
    const res = await fetch('/api/editorial-summary', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load editorial summary.');
    return res.json();
  } catch {
    return {
      updatedAtISO: new Date().toISOString(),
      hero: {
        kpiLabel: 'Aprovacoes',
        kpiValue: '-',
        status: 'EM_DISPUTA',
        statusLabel: 'EM DISPUTA',
      },
      headline: {
        title: 'Resumo indisponivel',
        subtitle: 'Nao foi possivel carregar o resumo editorial.',
      },
      highlights: [
        { label: 'Indicador principal', value: '-', note: undefined },
        { label: 'Lider do momento', value: '-', note: undefined },
        { label: 'Status da campanha', value: 'EM DISPUTA', note: undefined },
      ],
      top3: [
        { rank: 1, name: '-', value: '-' },
        { rank: 2, name: '-', value: '-' },
        { rank: 3, name: '-', value: '-' },
      ],
    };
  }
}

export default async function HomePage() {
  const vm = await getEditorialSummary();

  return (
    <>
      <EditorialNav />
      <main className="w-full">
        <HeroGlass />
        <EditorialSummary vm={vm} />
      </main>
    </>
  );
}
