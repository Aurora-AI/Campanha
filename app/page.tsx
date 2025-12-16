"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import type { MetricsPayload } from "@/lib/metrics/compute";
import CoverHero from "@/components/editorial/CoverHero";
import CoverKpiStrip from "@/components/editorial/CoverKpiStrip";
import TopStoresToday from "@/components/editorial/TopStoresToday";
import LeadersPeriod from "@/components/editorial/LeadersPeriod";
import ManagerRadar from "@/components/editorial/ManagerRadar";

type LoadStatus = "empty" | "ok" | "error";

const CoverSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-56 md:h-64 rounded-4xl bg-gray-100 border border-gray-200" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="h-24 rounded-3xl bg-gray-100 border border-gray-200" />
      ))}
    </div>
    <div className="h-56 rounded-4xl bg-gray-100 border border-gray-200" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-72 rounded-4xl bg-gray-100 border border-gray-200" />
      <div className="h-72 rounded-4xl bg-gray-100 border border-gray-200" />
    </div>
  </div>
);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LoadStatus>("empty");
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/metrics", { cache: "no-store" });

      if (res.status === 404) {
        setMetrics(null);
        setStatus("empty");
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setMetrics(null);
        setStatus("error");
        setError(text || "Falha ao carregar /api/metrics");
        return;
      }

      const json = (await res.json()) as MetricsPayload;
      if (!json?.meta || !json?.headline || !json?.stores) {
        setMetrics(null);
        setStatus("error");
        setError("Resposta inválida de /api/metrics");
        return;
      }

      setMetrics(json);
      setStatus("ok");
    } catch (err) {
      console.warn("Home: erro ao carregar /api/metrics", err);
      setMetrics(null);
      setStatus("error");
      setError("Erro de rede ao carregar /api/metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const topToday =
    metrics?.stores
      ? [...metrics.stores]
          .sort((a, b) => b.yesterdayApproved - a.yesterdayApproved || a.store.localeCompare(b.store))
          .filter((s) => s.yesterdayApproved > 0)
          .slice(0, 3)
          .map((s) => ({ store: s.store, yesterdayApproved: s.yesterdayApproved, approvalRate: s.approvalRate }))
      : [];

  const leaders = metrics?.rankings?.storesBySharePct ? metrics.rankings.storesBySharePct.slice(0, 5) : [];

  const radar =
    metrics?.stores
      ? [...metrics.stores]
          .sort((a, b) => b.pending.total - a.pending.total || a.store.localeCompare(b.store))
          .filter((s) => s.pending.total > 0)
          .slice(0, 3)
          .map((s) => ({ store: s.store, pendingTotal: s.pending.total, messageToManager: s.pending.messageToManager }))
      : [];

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="text-sm font-bold tracking-[0.3em] uppercase text-gray-900">Mycelium</div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="px-4 py-2 text-xs font-bold tracking-widest rounded-full border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors"
            disabled={loading}
          >
            {loading ? "ATUALIZANDO…" : "RECARREGAR"}
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-black text-white text-xs font-bold tracking-widest rounded-full hover:scale-105 transition-transform"
          >
            ABRIR DASHBOARD
          </Link>
        </div>
      </header>

      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pb-16 space-y-8">
        {loading && !metrics && <CoverSkeleton />}

        {!loading && status === "empty" && (
          <div className="bg-white rounded-4xl p-10 border border-gray-100 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-xs tracking-widest">
              Nenhum CSV publicado ainda
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-900">Capa Editorial</h1>
            <p className="text-gray-600">
              Envie o CSV para publicar a campanha e gerar a revista de dados.
            </p>
            <div className="pt-2">
              <Link href="/dashboard" className="text-sm underline underline-offset-4 text-gray-900 hover:text-black">
                Ir para upload e detalhamento
              </Link>
            </div>
          </div>
        )}

        {!loading && status === "error" && (
          <div className="bg-red-50 rounded-4xl p-8 border border-red-200 text-center space-y-3">
            <div className="text-sm font-bold text-red-800">Erro ao carregar métricas</div>
            <div className="text-sm text-red-700">{error ?? "Tente novamente."}</div>
            <div className="pt-2 flex items-center justify-center gap-4">
              <button
                onClick={load}
                className="px-4 py-2 text-xs font-bold tracking-widest rounded-full border border-red-300 hover:border-red-700 hover:bg-red-700 hover:text-white transition-colors"
                disabled={loading}
              >
                {loading ? "ATUALIZANDO…" : "RECARREGAR"}
              </button>
              <Link href="/dashboard" className="text-sm underline underline-offset-4 text-red-900 hover:text-red-950">
                Abrir dashboard
              </Link>
            </div>
          </div>
        )}

        {metrics && status === "ok" && (
          <>
            <CoverHero
              lastDay={metrics.meta.lastDay}
              totalApproved={metrics.headline.totalApproved}
              yesterdayApproved={metrics.headline.yesterdayApproved}
            />

            <CoverKpiStrip
              deltaVsPrevDay={metrics.headline.deltaVsPrevDay}
              deltaVsSameWeekday={metrics.headline.deltaVsSameWeekday}
              deltaVsSameMonthDay={metrics.headline.deltaVsSameMonthDay}
              deltaVsSameYearDay={metrics.headline.deltaVsSameYearDay}
            />

            <TopStoresToday lastDay={metrics.meta.lastDay} items={topToday} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeadersPeriod items={leaders} />
              <ManagerRadar items={radar} />
            </div>

            <footer className="pt-4 border-t border-gray-100 text-sm text-gray-600 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                Última atualização: {new Date(metrics.meta.uploadedAt).toLocaleString("pt-BR")} — período{" "}
                {metrics.meta.period.min} → {metrics.meta.period.max}
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
                  Ver miolo (detalhes)
                </Link>
              </div>
            </footer>
          </>
        )}
      </section>
    </main>
  );
}
