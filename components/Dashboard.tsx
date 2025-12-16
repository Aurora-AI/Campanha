"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Loader2, RefreshCw } from "lucide-react";
import { DashboardData } from "@/lib/pipeline";
import KPICards from "./KPICards";
import EvolutionChart from "./EvolutionChart";
import GroupPerformance from "./GroupPerformance";

export default function CalceleveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargaInfo, setCargaInfo] = useState<{ nome: string; data: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  type CampaignBlobPayload = {
    meta?: { source?: string; uploadedAt?: string; rows?: number };
    data: DashboardData;
  };

  // Reload latest campaign data from Blob via API (source of truth)
  const reloadLatestFromBlob = async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (!res.ok) return false;

      const payload = (await res.json()) as CampaignBlobPayload;
      if (!payload?.data) return false;

      setData(payload.data);
      setCargaInfo({
        nome: payload.meta?.source || "campanha-data.json",
        data: payload.meta?.uploadedAt || new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.error("Erro ao carregar /api/data:", err);
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
    setStatusMessage(null);

    try {
      const loaded = await reloadLatestFromBlob();
      if (loaded) {
        setStatusMessage("✅ Dashboard sincronizado com a última versão");
        setTimeout(() => setStatusMessage(null), 3000);
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
    setStatusMessage(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao enviar CSV");
      }

      const loaded = await reloadLatestFromBlob();
      if (!loaded) throw new Error("CSV enviado, mas não foi possível carregar /api/data");

      setStatusMessage("✅ CSV enviado com sucesso");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      e.target.value = "";
      setLoading(false);
    }
  };

  return (
    <section className="w-full space-y-10">
      
      {/* Header with Load Info */}
      {cargaInfo && (
        <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-4xl p-4 border border-blue-200 flex justify-between items-center">
          <p className="text-sm text-blue-900">
            <span className="font-bold">📊 Última atualização:</span> {new Date(cargaInfo.data).toLocaleString("pt-BR")} — <span className="italic">{cargaInfo.nome}</span>
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

      {!cargaInfo && !loading && (
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
        <p className="text-gray-500 mb-8">Importe o CSV diário para apuração de metas e grupos.</p>
        
        {!data && (
          <label className="inline-flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-12 py-10 transition hover:bg-gray-100 hover:border-gray-300">
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            {loading ? <Loader2 className="h-8 w-8 animate-spin text-gray-400" /> : <UploadCloud className="h-8 w-8 text-gray-400" />}
            <span className="mt-2 text-sm font-semibold text-gray-600">{loading ? "Processando..." : "Selecionar Arquivo CSV"}</span>
          </label>
        )}

         {error && <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}
         {statusMessage && <div className="mt-4 text-green-700 bg-green-50 p-3 rounded-lg text-sm">{statusMessage}</div>}
         
         {data && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-center gap-4">
                <div className="text-sm text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full">
                  ✅ Base Carregada: {data.metrics.total} registros
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
          
          {/* 1. Visão Geral (KPIs) */}
          <KPICards metrics={data.metrics} />

          {/* 2. Performance por Grupo (O Coração da Campanha) */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Apuração por Grupos</h2>
            <GroupPerformance weeks={data.metrics.weeks} />
          </div>

          {/* 3. Evolução */}
          <div className="bg-white p-6 rounded-4xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Evolução Diária de Aprovações</h2>
            <EvolutionChart data={data.metrics.dailyEvolution} />
          </div>

          {/* 4. Como funciona */}
          <div className="bg-blue-50 rounded-4xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">ℹ️ Como Funciona</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li><strong>Meta do Grupo:</strong> soma das metas individuais (G1: 60, G2: 108, G3: 54)</li>
              <li><strong>Grupo Elegível:</strong> quando a soma de aprovações bate a meta do grupo</li>
              <li><strong>Loja Elegível:</strong> quando o grupo é elegível E a loja bate sua meta individual</li>
              <li><strong>Vencedores (Top 3):</strong> apenas lojas elegíveis, ordenadas por % atingimento</li>
              <li><strong>Zeramento:</strong> metas reiniciam a cada segunda-feira (semana canônica)</li>
            </ul>
          </div>
          
        </div>
      )}
    </section>
  );
}
