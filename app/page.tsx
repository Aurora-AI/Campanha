"use client";

// CONTRACT NOTE (Home = Presentation Layer):
// - Home must render only what comes from GET /api/latest
// - No calculations, no aggregation, no new business rules
// - If a needed field is missing in the snapshot, show elegant fallback ("—")
// - Snapshot minimum expected: publishedAt, optional sourceFileName, optional payload fields

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchLatest } from "@/lib/latestClient";
import { toHomeViewModel, type HomeViewModel } from "@/lib/homeSnapshot";

export const dynamic = "force-dynamic";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"empty" | "ok">("empty");
  const [vm, setVm] = useState<HomeViewModel | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetchLatest();
    if (res.status === "ok" && res.snapshot) {
      setVm(toHomeViewModel(res.snapshot));
      setStatus("ok");
    } else {
      setVm(null);
      setStatus("empty");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const leaderGroup = vm?.leaderGroup ?? "—";
  const leaderValue = vm?.leaderValue ?? "—";
  const leaderGap = vm?.leaderGapToSecond;

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col">
      {/* Topbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="text-sm font-bold tracking-[0.3em] uppercase text-gray-900">Calceleve</div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="px-4 py-2 text-xs font-bold tracking-widest rounded-full border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors"
            disabled={loading}
          >
            {loading ? "ATUALIZANDO…" : "RECARREGAR"}
          </button>
          <Link href="/dashboard" className="px-4 py-2 bg-black text-white text-xs font-bold tracking-widest rounded-full hover:scale-105 transition-transform">
            VER DETALHES
          </Link>
        </div>
      </header>

      {/* EMPTY STATE */}
      {status === "empty" && (
        <section className="flex-1 flex items-center justify-center text-center px-6">
          <div className="space-y-6 max-w-xl">
            <h1 className="text-4xl md:text-6xl font-serif font-medium text-gray-900">Painel Aceleração 2025</h1>
            <p className="text-gray-600">Nenhuma atualização publicada ainda.</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-xs tracking-widest">
              Resultados visíveis para reconhecimento. Prêmios ainda não desbloqueados.
            </div>
            <div className="pt-4">
              <Link href="/dashboard" className="text-sm underline underline-offset-4 text-gray-900 hover:text-black">
                Acessar área de publicação
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* DATA STATE */}
      {status === "ok" && (
        <section className="flex-1 flex flex-col items-center justify-start max-w-7xl mx-auto px-6 py-10 gap-12">
          {/* Hero */}
          <div className="w-full grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-serif font-medium text-gray-900 leading-[1.1]">
                Painel Aceleração 2025
              </h1>
              <p className="text-gray-500 text-lg">Resultados em tempo real (publicação oficial)</p>
              <div className="mt-6 p-6 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm transition-all">
                <div className="text-[11px] font-bold tracking-[0.25em] text-gray-500">LÍDER ATUAL</div>
                <div className="mt-2 text-2xl md:text-3xl font-medium text-gray-900">{leaderGroup}</div>
                <div className="mt-1 text-4xl md:text-5xl font-serif text-black">{leaderValue}</div>
                {leaderGap != null && (
                  <div className="mt-2 text-sm text-gray-600">distância para o 2º: {String(leaderGap)}</div>
                )}
              </div>
            </div>
            {/* Visual subtle block */}
            <div className="h-64 md:h-80 w-full rounded-2xl bg-linear-to-br from-gray-100 to-white shadow-inner" />
          </div>

          {/* Podium Top 3 */}
          <div className="w-full">
            <div className="text-[11px] font-bold tracking-[0.25em] text-gray-500">PODIUM</div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {(vm?.top3 ?? []).slice(0, 3).map((item, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border bg-white/70 transition-all ${idx === 0 ? "border-black" : "border-gray-200"}`}>
                  <div className="text-xs text-gray-500">{idx + 1}º</div>
                  <div className="mt-1 text-xl font-medium text-gray-900">{item?.group ?? "—"}</div>
                  <div className={`mt-1 text-3xl font-serif ${idx === 0 ? "text-black" : "text-gray-800"}`}>{item?.value ?? "—"}</div>
                </div>
              ))}
              {(!vm?.top3 || vm.top3.length === 0) && (
                <div className="p-5 rounded-2xl border border-dashed border-gray-200 text-gray-500">Top 3 indisponível no snapshot</div>
              )}
            </div>
          </div>

          {/* Status de Prêmios */}
          <div className="w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-xs tracking-widest">
              Resultados visíveis para reconhecimento. Prêmios ainda não desbloqueados.
            </div>
          </div>

          {/* Chase list (opcional) */}
          {vm?.chase && vm.chase.length > 0 && (
            <div className="w-full">
              <div className="text-[11px] font-bold tracking-[0.25em] text-gray-500">PRESSÃO</div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {vm.chase.slice(0, 5).map((c, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-white/70 flex items-center justify-between">
                    <div className="text-gray-900 font-medium">{c.group ?? "—"}</div>
                    <div className="text-sm text-gray-600">gap: {c.gap != null ? String(c.gap) : "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta ruler (opcional) */}
          {vm?.metaRuler && (
            <div className="w-full">
              <div className="text-[11px] font-bold tracking-[0.25em] text-gray-500">RÉGUA DE META</div>
              <div className="mt-3 p-5 rounded-2xl border border-gray-200 bg-white/70">
                <div className="text-gray-900 font-medium">{vm.metaRuler.goalLabel ?? "Meta"}</div>
                <div className="mt-1 text-3xl font-serif text-black">{vm.metaRuler.goalValue ?? "—"}</div>
              </div>
            </div>
          )}

          {/* Footer factual */}
          <footer className="w-full pt-6 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
            <div>
              Última atualização: {vm?.publishedAt ?? "—"}
              {" "}—{" "}
              {vm?.sourceFileName ?? "Versão Pública"}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={load}
                className="px-4 py-2 text-xs font-bold tracking-widest rounded-full border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors"
                disabled={loading}
              >
                {loading ? "ATUALIZANDO…" : "RECARREGAR"}
              </button>
              <Link href="/dashboard" className="text-sm underline underline-offset-4 text-gray-900 hover:text-black">
                Ver detalhes
              </Link>
            </div>
          </footer>
        </section>
      )}
    </main>
  );
}
