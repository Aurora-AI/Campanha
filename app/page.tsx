import { getLatestSnapshot } from '@/lib/publisher';
import { buildHomeViewModel } from '@/src/features/home/mappers/buildHomeViewModel';
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
  let snapshot = null;
  try {
    snapshot = await getLatestSnapshot();
  } catch {
    snapshot = null;
  }

  const vm = buildHomeViewModel(snapshot);

  return (
    <>
      <Header />
      <Hero cover={vm.cover} />
      <SectionYesterday
        title={vm.movement.title}
        subtitle={vm.movement.subtitle}
        summary={vm.movement.summary}
        timeline={vm.movement.timeline}
        podium={vm.podium}
        storeList={vm.storeList}
      />
      <SectionGroups vm={vm.campaign} action={vm.spread.right} />
      <SectionReengagement data={vm.reengagement} />
      <SectionKPIs items={vm.highlights} />
      <SectionTotal data={vm.accumulated} />
      <Footer links={vm.archive.links} />
    </>
  );
}
