import Link from "next/link";

import HomePageClient, { type HomePageClientState } from "@/components/pages/HomePageClient";
import { loadHeroPayload } from "@/lib/hero/loadHeroPayload";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let state: HomePageClientState;
  try {
    const result = await loadHeroPayload();
    state = result.status === "empty" ? { status: "empty" } : { status: "ok", payload: result.payload };
  } catch (err) {
    state = { status: "error", message: err instanceof Error ? err.message : "Erro ao carregar dados" };
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto w-full max-w-7xl px-6 py-8 flex items-center justify-between">
        <div className="text-[11px] font-bold tracking-[0.35em] uppercase text-foreground/80">Mycelium</div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-full border border-black/10 bg-background text-xs font-bold tracking-widest hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            RECARREGAR
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold tracking-widest hover:opacity-90 transition-opacity"
          >
            DASHBOARD
          </Link>
        </div>
      </header>

      <HomePageClient state={state} />
    </main>
  );
}

