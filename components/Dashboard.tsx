"use client";

import { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { processCSV, DashboardData } from "@/lib/pipeline";
import KPICards from "./KPICards";
import EvolutionChart from "./EvolutionChart";
import GroupPerformance from "./GroupPerformance";

export default function CalceleveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await processCSV(file);
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full space-y-10">
      
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
        
        {data && (
           <div className="mt-4 flex justify-center gap-4">
             <div className="text-sm text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full">
               ✅ Base Carregada: {data.metrics.total} registros
             </div>
             <button onClick={() => setData(null)} className="text-sm text-gray-400 hover:text-black underline">
               Trocar Arquivo
             </button>
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
          
        </div>
      )}
    </section>
  );
}
