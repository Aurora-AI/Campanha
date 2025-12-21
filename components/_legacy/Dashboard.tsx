"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UploadCloud, Loader2, RefreshCw } from "lucide-react";
import type { MetricsPayload } from "@/lib/metrics/compute";

export default function CalceleveDashboard() {
  const [data, setData] = useState<MetricsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);

  // Reload latest editorial metrics from Blob via API (source of truth)
  const reloadLatestFromBlob = async () => {
    try {
      const res = await fetch("/api/metrics", { cache: "no-store" });
      if (!res.ok) return false;

      const payload = (await res.json()) as MetricsPayload;
      if (!payload?.meta || !payload?.headline || !payload?.stores) return false;

      setData(payload);
      return true;
    } catch (err) {
      console.error("Erro ao carregar /api/metrics:", err);
      return false;
    }
  };

  // Load latest on mount
  useEffect(() => {
    const loadPublic = async () => {
      setLoading(true);
      try {
        await reloadLatestFromBlob();
      } finally {
        setLoading(false);
      }
    };
    loadPublic();
  }, []);

  const handleReload = async () => {
    setLoading(true);
    setError(null);
    setStatusMessages([]);

    try {
      const loaded = await reloadLatestFromBlob();
      if (loaded) {
        setStatusMessages(["✅ Dashboard sincronizado com a última versão"]);
        setTimeout(() => setStatusMessages([]), 3000);
        return;
      }
      setError("Nenhuma atualização publicada ainda.");
    } catch (err) {
      setError("Erro ao recarregar última versão");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setData(null);
    setStatusMessages([]);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao enviar CSV");
      }

      const loaded = await reloadLatestFromBlob();
      if (!loaded) throw new Error("CSV enviado, mas não foi possível carregar /api/metrics");

      setStatusMessages(["✅ campanha-data.json atualizado", "✅ snapshot publicado (Home atualizada)"]);
      setTimeout(() => setStatusMessages([]), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      e.target.value = "";
      setLoading(false);
    }
  };

  const fmtPct = (v: number | null | undefined) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);
  const fmtDelta = (delta: { abs: number; pct: number | null } | undefined) => {
    if (!delta) return "—";
    const abs = delta.abs >= 0 ? `+${delta.abs}` : String(delta.abs);
    const pct = delta.pct == null ? "—" : `${(delta.pct * 100).toFixed(1)}%`;
    return `${abs} (${pct})`;
  };

  return (
    <section className="w-full space-y-10">
      
      {/* Header with Load Info */}
      {data?.meta && (
        <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-4xl p-4 border border-blue-200 flex justify-between items-center">
          <p className="text-sm text-blue-900">
            <span className="font-bold">📊 Última atualização:</span> {new Date(data.meta.uploadedAt).toLocaleString("pt-BR")} —{" "}
            <span className="italic">
              período {data.meta.period.min} → {data.meta.period.max} (último dia: {data.meta.lastDay})
            </span>
          </p>
          <button
            onClick={handleReload}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Recarregar
          </button>
        </div>
      )}

      {!data?.meta && !loading && (
        <div className="bg-yellow-50 rounded-4xl p-6 border border-yellow-200 text-center space-y-3">
          <p className="text-sm text-yellow-900 font-semibold">
            📭 Nenhum CSV enviado ainda.
          </p>
          <p className="text-xs text-yellow-800">
            Faça upload do CSV abaixo para começar.
          </p>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-4xl p-8 shadow-sm border border-gray-100 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Aceleração 2025</h1>
          <p className="text-gray-500 mb-8">Importe o relatório de propostas/cartões para apuração de captação.</p>
        
        {!data && (
          <label className="inline-flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-12 py-10 transition hover:bg-gray-100 hover:border-gray-300">
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            {loading ? <Loader2 className="h-8 w-8 animate-spin text-gray-400" /> : <UploadCloud className="h-8 w-8 text-gray-400" />}
            <span className="mt-2 text-sm font-semibold text-gray-600">{loading ? "Processando..." : "Selecionar Arquivo CSV"}</span>
          </label>
        )}

         {error && <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}
         {statusMessages.length > 0 && (
            <div className="mt-4 space-y-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {statusMessages.map((message) => (
                <div key={message}>{message}</div>
              ))}
              <div>
                <Link href="/" className="text-green-900 underline underline-offset-4">
                  Abrir Home
                </Link>
              </div>
            </div>
          )}
         
         {data && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-center gap-4">
                <div className="text-sm text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full">
                  ✅ Base Carregada: {data.meta.rows} linhas
                </div>
                <button onClick={() => setData(null)} className="text-sm text-gray-400 hover:text-black underline">
                  Trocar Arquivo
                </button>
              </div>
            </div>
         )}
       </div>

      {data && (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* 1. Headline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-4xl p-6 border border-gray-100">
              <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Total aprovados</div>
              <div className="mt-2 text-4xl font-black text-gray-900">{data.headline.totalApproved}</div>
            </div>
            <div className="bg-white rounded-4xl p-6 border border-gray-100">
              <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Aprovados no último dia ({data.meta.lastDay})</div>
              <div className="mt-2 text-4xl font-black text-gray-900">{data.headline.yesterdayApproved}</div>
            </div>
          </div>

          {/* 2. Comparativos */}
          <div className="bg-white rounded-4xl p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Comparativos (último dia)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-gray-50">
                <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">vs D-2</div>
                <div className="mt-2 font-bold text-gray-900">{fmtDelta(data.headline.deltaVsPrevDay)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50">
                <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">vs semana anterior</div>
                <div className="mt-2 font-bold text-gray-900">{fmtDelta(data.headline.deltaVsSameWeekday)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50">
                <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">vs mês anterior</div>
                <div className="mt-2 font-bold text-gray-900">{fmtDelta(data.headline.deltaVsSameMonthDay)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50">
                <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">vs ano anterior</div>
                <div className="mt-2 font-bold text-gray-900">{fmtDelta(data.headline.deltaVsSameYearDay)}</div>
              </div>
            </div>
          </div>

          {/* 3. Ranking geral */}
          <div className="bg-white rounded-4xl p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ranking geral (Top 10 por participação)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-500">
                  <tr className="border-b border-gray-100">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Loja</th>
                    <th className="py-2 pr-4 text-right">Aprovados</th>
                    <th className="py-2 text-right">Participação</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankings.storesBySharePct.slice(0, 10).map((r, idx) => (
                    <tr key={`${r.store}-${idx}`} className="border-b border-gray-50">
                      <td className="py-2 pr-4 text-gray-400 font-mono">#{idx + 1}</td>
                      <td className="py-2 pr-4 font-medium text-gray-900">{r.store}</td>
                      <td className="py-2 pr-4 text-right font-bold text-gray-900">{r.approved}</td>
                      <td className="py-2 text-right text-gray-600">{fmtPct(r.sharePct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Cards por loja */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lojas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.stores.map((s) => (
                <div key={s.store} className="bg-white rounded-4xl p-6 border border-gray-100 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-bold text-gray-900">{s.store}</div>
                      {s.cnpj && <div className="text-xs text-gray-500">CNPJ: {s.cnpj}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Taxa de aprovação</div>
                      <div className="text-lg font-black text-gray-900">{fmtPct(s.approvalRate)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="p-3 rounded-2xl bg-gray-50">
                      <div className="text-xs text-gray-500">Aprovados</div>
                      <div className="font-bold text-gray-900">{s.approved}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50">
                      <div className="text-xs text-gray-500">Reprovados</div>
                      <div className="font-bold text-gray-900">{s.rejected}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50">
                      <div className="text-xs text-gray-500">Decididos</div>
                      <div className="font-bold text-gray-900">{s.decided}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50">
                      <div className="text-xs text-gray-500">Aprovados (último dia)</div>
                      <div className="font-bold text-gray-900">{s.yesterdayApproved}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <div className="text-xs font-bold tracking-widest text-amber-700 uppercase">Pendências</div>
                      <div className="mt-1 text-lg font-black text-amber-900">{s.pending.total}</div>
                      <div className="mt-2 text-xs text-amber-900">{s.pending.messageToManager}</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700">
                    <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Pendências por tipo</div>
                    <div className="grid grid-cols-2 gap-2">
                      {s.pending.byType.map((p) => (
                        <div key={p.type} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                          <span className="text-gray-600">{p.type}</span>
                          <span className="font-bold text-gray-900">{p.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {s.pending.sampleCpfsMasked.length > 0 && (
                    <div className="text-sm text-gray-700">
                      <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Amostra de CPFs (mascarados)</div>
                      <div className="text-xs text-gray-600 break-words">{s.pending.sampleCpfsMasked.join(", ")}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Como funciona */}
          <div className="bg-blue-50 rounded-4xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">ℹ️ Como Funciona</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li><strong>Métrica soberana:</strong> Aprovados (situação normalizada == APROVADO)</li>
              <li><strong>Taxa de aprovação:</strong> APROVADO / (APROVADO + REPROVADO)</li>
              <li><strong>Comparativos:</strong> calculados sempre contra o último dia presente no CSV</li>
              <li><strong>Pendências:</strong> Análise, Pendente, Aguardando Documentos, Aguardando Finalizar Cadastro</li>
              <li><strong>CPFs:</strong> já vêm mascarados no CSV (não re-mascarar)</li>
            </ul>
          </div>
          
        </div>
      )}
    </section>
  );
}
