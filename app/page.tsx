import { getHomeViewModel } from '@/lib/server/homeViewModel';
import Header from '@/components/campaign/Header';
import Hero from '@/components/campaign/Hero';
import Footer from '@/components/campaign/Footer';
import SectionGroups from '@/components/campaign/SectionGroups';
import SectionYesterday from '@/components/campaign/SectionYesterday';
import SectionComparative from '@/components/campaign/SectionComparative';
import SectionReengagement from '@/components/campaign/SectionReengagement';
import SectionKPIs from '@/components/campaign/SectionKPIs';
import SectionTotal from '@/components/campaign/SectionTotal';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await getHomeViewModel();

  return (
    <>
      <Header />
      <Hero data={data.hero} />
      <SectionYesterday data={data.movement} />
      <SectionComparative data={data.trendComparative} coverage={data.dataCoverage} />
      <SectionGroups campaign={data.campaign} groups={data.groups} metaAudit={data.metaAudit} />
      <SectionReengagement data={data.reengagement} />
      <SectionKPIs data={data.kpis} />
      <SectionTotal data={data.storesMonthly} />
      <Footer />
    </>
  );
}
