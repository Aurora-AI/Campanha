import { getLatestSnapshot } from '@/lib/publisher';
import { adaptSnapshotToCampaign } from '@/lib/campaign/adapter';
import Header from '@/components/campaign/Header';
import Hero from '@/components/campaign/Hero';
import Footer from '@/components/campaign/Footer';
import SectionGroups from '@/components/campaign/SectionGroups';
import SectionYesterday from '@/components/campaign/SectionYesterday';
import SectionReengagement from '@/components/campaign/SectionReengagement';
import SectionKPIs from '@/components/campaign/SectionKPIs';
import SectionTotal from '@/components/campaign/SectionTotal';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const snapshot = await getLatestSnapshot();
  const data = adaptSnapshotToCampaign(snapshot);

  return (
    <>
      <Header />
      <Hero data={data.hero} />
      <SectionYesterday data={data.movement.timeline as any} />
      <SectionGroups data={data.campaign} />
      <SectionReengagement data={data.reengagement} />
      <SectionKPIs data={data.kpis} />
      <SectionTotal data={data.accumulated} />
      <Footer />
    </>
  );
}
