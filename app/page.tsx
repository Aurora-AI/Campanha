import Link from "next/link";
import PuzzlePhysicsHero from "@/components/PuzzlePhysicsHero";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col">
      {/* Header Minimalista */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="text-sm font-bold tracking-[0.3em] uppercase text-gray-900">Calceleve</div>
        <Link href="/dashboard" className="px-6 py-2 bg-black text-white text-xs font-bold tracking-widest rounded-full hover:scale-105 transition-transform">
          DASHBOARD
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-6 gap-12 md:gap-24 py-12">
        {/* Texto */}
        <div className="flex-1 space-y-6 text-center md:text-left z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-medium text-gray-900 leading-[1.1]">
            A elegância
            <br />
            está nos dados.
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto md:mx-0">
            Acompanhe a campanha Aceleração 2025 com inteligência e precisão.
          </p>
        </div>

        {/* O Troféu Interativo */}
        <div className="flex-1 flex justify-center">
          <PuzzlePhysicsHero size={450} src="/images/hero-final.png" />
        </div>
      </section>
    </main>
  );
}
