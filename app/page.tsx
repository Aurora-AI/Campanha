import Header from '@/components/campaign/Header';
import SectionYesterday from '@/components/campaign/SectionYesterday';
import SectionGroups from '@/components/campaign/SectionGroups';
import SectionReengagement from '@/components/campaign/SectionReengagement';
import SectionKPIs from '@/components/campaign/SectionKPIs';
import SectionTotal from '@/components/campaign/SectionTotal';
import Footer from '@/components/campaign/Footer';
import HeroGlass from '@/components/hero/HeroGlass';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="w-full">
        <HeroGlass />
        <SectionYesterday />
        <SectionGroups />
        <SectionReengagement />
        <SectionKPIs />
        <SectionTotal />
      </main>
      <Footer />
    </>
  );
}
